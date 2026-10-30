import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  @Input({ required: true }) currentPage!: number;
  @Input({ required: true }) pageCount!: number;
  @Output() readonly pageChange = new EventEmitter<number>();

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.pageCount) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }
}
