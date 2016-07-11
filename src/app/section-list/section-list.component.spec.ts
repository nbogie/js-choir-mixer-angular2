/* tslint:disable:no-unused-variable */

import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import {
  beforeEach, beforeEachProviders,
  describe, xdescribe,
  expect, it, xit,
  async, inject
} from '@angular/core/testing';

import { SectionListComponent } from './section-list.component';

describe('Component: SectionList', () => {
  it('should create an instance', () => {
    let component = new SectionListComponent();
    expect(component).toBeTruthy();
  });
});
