import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TicketCategory, TicketPriority } from '../../../core/models/ticket.model';
import { TicketService } from '../services/ticket.service';
import { TicketFormPage } from './ticket-form-page';
import { makeTestTicket } from './ticket-page-test-helpers';

describe('TicketFormPage', () => {
  it('shows required and email validation and does not create invalid data', async () => {
    const create = vi.fn();
    await TestBed.configureTestingModule({
      imports: [TicketFormPage],
      providers: [
        provideRouter([]),
        { provide: TicketService, useValue: { storageError: signal(null), create } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(TicketFormPage);
    fixture.componentInstance.form.patchValue({ requesterEmail: 'invalid' });
    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(create).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Informe um título.');
    expect(fixture.nativeElement.textContent).toContain('Informe um endereço de e-mail válido.');
  });

  it('creates a valid ticket and navigates to its details with success feedback', async () => {
    const ticket = makeTestTicket();
    const create = vi.fn(() => ticket);
    await TestBed.configureTestingModule({
      imports: [TicketFormPage],
      providers: [
        provideRouter([]),
        { provide: TicketService, useValue: { storageError: signal(null), create } },
      ],
    }).compileComponents();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(TicketFormPage);
    fixture.componentInstance.form.setValue({
      title: 'Falha no acesso',
      description: 'A página não abre.',
      requester: 'Camila',
      requesterEmail: 'camila@example.com',
      category: TicketCategory.Software,
      priority: TicketPriority.Medium,
    });
    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(create).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith(['/tickets', ticket.id], {
      queryParams: { created: '1' },
    });
  });
});
