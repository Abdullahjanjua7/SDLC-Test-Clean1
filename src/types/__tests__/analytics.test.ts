import {
  AnalyticsProperties,
  AnalyticsEventName,
  BaseAnalyticsEvent,
  PageViewEventProperties,
  ClickEventProperties,
  FormSubmitEventProperties,
  ProductItemProperties,
  AddToCartEventProperties,
  PurchaseEventProperties,
  AnalyticsUser,
  AnalyticsContext,
  AnalyticsEvent,
  AnalyticsPayload,
  EventProperties,
  TrackFunction,
  IdentifyFunction,
  SetContextFunction,
  AnalyticsClient,
} from './analytics'; // Assuming the file is named analytics.ts

describe('Analytics Types and Interfaces', () => {
  // Test AnalyticsProperties
  it('should correctly define AnalyticsProperties allowing various primitive types and nested structures', () => {
    const properties: AnalyticsProperties = {
      stringProp: 'hello',
      numberProp: 123,
      booleanProp: true,
      nullProp: null,
      undefinedProp: undefined,
      stringArray: ['a', 'b', 'c'],
      numberArray: [1, 2, 3],
      booleanArray: [true, false],
      mixedArray: ['a', 1, true, null, undefined],
      nestedObject: {
        nestedString: 'world',
        nestedNumber: 456,
      },
      arrayOfObjects: [
        { id: 'item1', value: 10 },
        { id: 'item2', value: 20 },
      ],