import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from '@shared/services/message/message.service';
import { UploadService } from '@core/services/upload/upload.service';
import { PromptService } from '@core/services/prompt/prompt.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { DataService } from '@shared/services/data/data.service';

export const BASE_TEST_CONFIG = {
  imports: [
    HttpClientTestingModule,
    RouterTestingModule,
    FormsModule,
    ReactiveFormsModule
  ] as any[],
  providers: [
    CookieService,
    MessageService,
    UploadService,
    PromptService,
    DataService,
    FolderViewService,
    PrConstantsService
  ] as any[],
  declarations: [
  ] as any[]
};

// export {
//   TestBed,
//   async,
//   FormsModule,
//   ReactiveFormsModule,
//   RouterTestingModule,
//   HttpClientModule,
//   CookieService,
//   MessageService,
//   UploadService,
//   PromptService
// };
