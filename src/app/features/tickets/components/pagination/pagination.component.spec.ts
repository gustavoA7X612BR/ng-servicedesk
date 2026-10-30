import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let fixture: ComponentFixture<PaginationComponent>;
  let component: PaginationComponent;

  function createComponent(currentPage: number, pageCount: number): void {
    TestBed.configureTestingModule({ imports: [PaginationComponent] });
    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('currentPage', currentPage);
    fixture.componentRef.setInput('pageCount', pageCount);
    fixture.detectChanges();
  }

  it('displays the current page and total page count', () => {
    createComponent(2, 5);

    expect(fixture.nativeElement.textContent).toContain('Página 2 de 5');
  });

  it('emits the next page when advancing', () => {
    createComponent(2, 5);
    const emittedPages: number[] = [];
    component.pageChange.subscribe((page) => emittedPages.push(page));

    const nextButton = fixture.nativeElement.querySelectorAll('button')[1] as HTMLButtonElement;
    nextButton.click();

    expect(emittedPages).toEqual([3]);
  });

  it('emits the previous page when going back', () => {
    createComponent(2, 5);
    const emittedPages: number[] = [];
    component.pageChange.subscribe((page) => emittedPages.push(page));

    const previousButton = fixture.nativeElement.querySelectorAll('button')[0] as HTMLButtonElement;
    previousButton.click();

    expect(emittedPages).toEqual([1]);
  });

  it('disables controls at the first and last page boundaries', () => {
    createComponent(1, 3);
    let buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(false);

    fixture.componentRef.setInput('currentPage', 3);
    fixture.detectChanges();
    buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    expect(buttons[0].disabled).toBe(false);
    expect(buttons[1].disabled).toBe(true);
  });

  it('disables both controls when there is only one page', () => {
    createComponent(1, 1);

    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(true);
  });
});
