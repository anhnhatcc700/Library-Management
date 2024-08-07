import { BookCartService } from './../../../reader-modules/book-search/book-search/book-cart.service';
import { error } from 'jquery';
import { BookChapterStatus } from 'src/app/enums/book-chapter-status';
import { Component, OnInit, ViewChild} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from 'src/app/services/http-service.service';
import { IBookChapter } from 'src/app/models/bookchapter.model';
import { BookChapterService } from './service/book-chapter.service';
import { Observable, first } from 'rxjs';
import { Table } from 'primeng/table'
import { ToastService } from 'src/app/services/toast.service';
import { MessageType } from 'src/app/enums/toast-message.enum';
import { ConfirmDialogService } from 'src/app/services/confirm-dialog.service';
import { BookService } from '../service/book.service';
import { IBook, IBookImage } from 'src/app/models/book.model';
import { RoleModulePermission } from 'src/app/models/role-permission.model';
import { ModuleEnum } from 'src/app/enums/module-enum';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-book-chapter',
  templateUrl: './book-chapter.component.html',
  styleUrls: ['./book-chapter.component.css']
})
export class BookChapterComponent implements OnInit {

  book$?: Observable<IBook | null>;
  selectedBookChapters!: IBookChapter[] | null;
  book: IBook | undefined;

  bookId: any;
  @ViewChild('dt') dt: Table | undefined;

  BookChapterStatus = BookChapterStatus;
  bookDetailPermission: RoleModulePermission | undefined;

  isStudent: boolean = false;

  constructor(
    private route: Router,
    private sessionService : SessionService,
    private bookChapterService: BookChapterService,
    private confirmDialogService: ConfirmDialogService,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private bookService: BookService,
    private bookCartService: BookCartService
  ) {}

  ngOnInit(): void {
    console.log(this.sessionService.getCurrentAccount())
    if(this.sessionService.getCurrentAccount()?.role.name !== 'Reader' && !this.sessionService.getModulePermission(ModuleEnum.BookChapter)?.access) {

      this.route.navigate(['book'])
    }
    else {
      console.log('here')
      
    }
    this.bookId = this.activatedRoute.snapshot.paramMap.get('id');
      this.bookChapterService.setCurrentBookId(this.bookId);
      this.getPermission(); 
      this.getBook();
  }

  getPermission() {
    this.bookDetailPermission = this.sessionService.getModulePermission(ModuleEnum.BookChapter);

    this.isStudent = this.sessionService.getCurrentAccount()?.role.name === 'Reader' ? true : false;
  }

  applyFilterGlobal($event: any, stringVal: any) {
    this.dt!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }

  getBook() {
    this.book$ = this.bookService.getBookById(this.bookId);
  }

  edit(id?: string) {
    this.route.navigate([{ outlets: { modal: ['bookchapter', 'edit', id] } }]);
  }
  editBook(id?: string) {
    this.route.navigate([{ outlets: { modal: ['book', 'edit', id] } }]);
  }

  deleteBookChapter(bookchapter: IBookChapter) {
    const bookchapterId = bookchapter?.id; 

    if (bookchapterId !== undefined) {
      this.confirmDialogService.showConfirmDialog(
        `
          Delete this chapter will also delete all borrow history records related to this chapter !!!.
          Are you sure you want to delete chapter ${bookchapter.chapter} ?.
        `
      )
        .subscribe((result) => {
          if (result) {
            this.bookChapterService.delete(bookchapterId).subscribe({
              next: () => {
                this.toastService.show(MessageType.success, 'Delete BookChapter Successfully');
                this.getBook();
              },
              error: (err: any) => {
                this.toastService.show(MessageType.error, err.error?.detail || 'Error deleting BookChapter');
              },
            });
          }
        });
    } else {
      console.error('book.id is undefined');
    }
  }

  addToCart(bookChapterId: string, bookName: string, chapter: string, bookImages: IBookImage[]) {
    const added = this.bookCartService.addToCart({ bookName, bookChapterId, chapter, bookImageBase64: bookImages.length ? bookImages[0].base64 : '' });

    if(added)
      this.toastService.show(MessageType.success, 'Your selected book is added to cart.')
  }
}
