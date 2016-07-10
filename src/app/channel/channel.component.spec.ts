/* tslint:disable:no-unused-variable */

import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import {
  beforeEach, beforeEachProviders,
  describe, xdescribe,
  expect, it, xit,
  async, inject
} from '@angular/core/testing';

import { ChannelComponent } from './channel.component';

describe('Component: Channel', () => {
  it('should create an instance', () => {
    let component = new ChannelComponent();
    expect(component).toBeTruthy();
  });
});
