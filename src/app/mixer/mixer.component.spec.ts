/* tslint:disable:no-unused-variable */

import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import {
  beforeEach, beforeEachProviders,
  describe, xdescribe,
  expect, it, xit,
  async, inject
} from '@angular/core/testing';

import { MixerComponent } from './mixer.component';

describe('Component: Mixer', () => {
  it('should create an instance', () => {
    let component = new MixerComponent();
    expect(component).toBeTruthy();
  });
});
