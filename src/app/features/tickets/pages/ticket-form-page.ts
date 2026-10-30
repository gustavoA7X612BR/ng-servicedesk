import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ACTIVE_DEMO_ACTOR } from '../../../core/data/demo-actors';
import { TicketCategory, TicketPriority } from '../../../core/models/ticket.model';
import { TicketService } from '../services/ticket.service';

@Component({
  selector: 'app-ticket-form-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './ticket-form-page.html',
  styleUrl: './ticket-form-page.scss',
})
export class TicketFormPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ticketService = inject(TicketService);
  readonly categories = Object.values(TicketCategory);
  readonly priorities = Object.values(TicketPriority);
  readonly storageError = this.ticketService.storageError;
  readonly submitError = signal('');
  readonly submitting = signal(false);
  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.maxLength(5000)]],
    requester: ['', [Validators.required, Validators.maxLength(100)]],
    requesterEmail: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    category: [TicketCategory.Software, Validators.required],
    priority: [TicketPriority.Medium, Validators.required],
  });

  get controls() {
    return this.form.controls;
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.submitError.set('');
    if (this.form.invalid || this.storageError()) return;
    this.submitting.set(true);
    try {
      const ticket = this.ticketService.create(
        this.form.getRawValue(),
        ACTIVE_DEMO_ACTOR.displayName,
      );
      void this.router.navigate(['/tickets', ticket.id], { queryParams: { created: '1' } });
    } catch (error) {
      this.submitError.set(
        error instanceof Error ? error.message : 'Não foi possível salvar o ticket.',
      );
      this.submitting.set(false);
    }
  }
}
