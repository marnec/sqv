import { TestBed } from '@angular/core/testing';

import { SqvLibService } from './sqv-lib.service';

describe('SqvLibService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SqvLibService = TestBed.get(SqvLibService);
    expect(service).toBeTruthy();
  });
});
