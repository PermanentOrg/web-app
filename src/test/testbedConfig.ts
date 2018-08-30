import { TestBed, async } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from '@shared/services/message/message.service';
import { UploadService } from '@core/services/upload/upload.service';
import { PromptService } from '@core/services/prompt/prompt.service';
import { FormInputComponent } from '@shared/components/form-input/form-input.component';

export const BASE_TEST_CONFIG = {
  imports: [
    HttpClientModule,
    RouterTestingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    CookieService,
    MessageService,
    UploadService,
    PromptService
  ],
  declarations: [
  ]
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
