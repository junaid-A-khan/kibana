/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { DEFAULT_SPACE_ID } from '../../common/constants';
import { SpacesSavedObjectsClient } from './spaces_saved_objects_client';
import { spacesServiceMock } from '../spaces_service/spaces_service.mock';
import { savedObjectsClientMock } from '../../../../../src/core/server/mocks';
import { SavedObjectTypeRegistry } from 'src/core/server';

const typeRegistry = new SavedObjectTypeRegistry();
typeRegistry.registerType({
  name: 'foo',
  namespaceType: 'single',
  hidden: false,
  mappings: { properties: {} },
});

typeRegistry.registerType({
  name: 'bar',
  namespaceType: 'single',
  hidden: false,
  mappings: { properties: {} },
});

typeRegistry.registerType({
  name: 'space',
  namespaceType: 'agnostic',
  hidden: true,
  mappings: { properties: {} },
});

const createMockRequest = () => ({});

const createMockClient = () => savedObjectsClientMock.create();

const createSpacesService = async (spaceId: string) => {
  return spacesServiceMock.createSetupContract(spaceId);
};

const createMockResponse = () => ({
  id: 'logstash-*',
  title: 'logstash-*',
  type: 'logstash-type',
  attributes: {},
  timeFieldName: '@timestamp',
  notExpandable: true,
  references: [],
});

const ERROR_NAMESPACE_SPECIFIED = 'Spaces currently determines the namespaces';

[
  { id: DEFAULT_SPACE_ID, expectedNamespace: undefined },
  { id: 'space_1', expectedNamespace: 'space_1' },
].forEach((currentSpace) => {
  describe(`${currentSpace.id} space`, () => {
    const createSpacesSavedObjectsClient = async () => {
      const request = createMockRequest();
      const baseClient = createMockClient();
      const spacesService = await createSpacesService(currentSpace.id);

      const client = new SpacesSavedObjectsClient({
        request,
        baseClient,
        spacesService,
        typeRegistry,
      });
      return { client, baseClient };
    };

    describe('#get', () => {
      test(`throws error if options.namespace is specified`, async () => {
        const { client } = await createSpacesSavedObjectsClient();

        await expect(client.get('foo', '', { namespace: 'bar' })).rejects.toThrow(
          ERROR_NAMESPACE_SPECIFIED
        );
      });

      test(`supplements options with the current namespace`, async () => {
        const { client, baseClient } = await createSpacesSavedObjectsClient();
        const expectedReturnValue = createMockResponse();
        baseClient.get.mockReturnValue(Promise.resolve(expectedReturnValue));

        const type = Symbol();
        const id = Symbol();
        const options = Object.freeze({ foo: 'bar' });
        // @ts-ignore
        const actualReturnValue = await client.get(type, id, options);

        expect(actualReturnValue).toBe(expectedReturnValue);
        expect(baseClient.get).toHaveBeenCalledWith(type, id, {
          foo: 'bar',
          namespace: currentSpace.expectedNamespace,
        });
      });
    });

    describe('#bulkGet', () => {
      test(`throws error if options.namespace is specified`, async () => {
        const { client } = await createSpacesSavedObjectsClient();

        await expect(
          client.bulkGet([{ id: '', type: 'foo' }], { namespace: 'bar' })
        ).rejects.toThrow(ERROR_NAMESPACE_SPECIFIED);
      });

      test(`supplements options with the current namespace`, async () => {
        const { client, baseClient } = await createSpacesSavedObjectsClient();
        const expectedReturnValue = { saved_objects: [createMockResponse()] };
        baseClient.bulkGet.mockReturnValue(Promise.resolve(expectedReturnValue));

        const objects = [{ type: 'foo' }];
        const options = Object.freeze({ foo: 'bar' });
        // @ts-ignore
        const actualReturnValue = await client.bulkGet(objects, options);

        expect(actualReturnValue).toBe(expectedReturnValue);
        expect(baseClient.bulkGet).toHaveBeenCalledWith(objects, {
          foo: 'bar',
          namespace: currentSpace.expectedNamespace,
        });
      });
    });

    describe('#find', () => {
      test(`throws error if options.namespace is specified`, async () => {
        const { client } = await createSpacesSavedObjectsClient();

        await expect(client.find({ type: 'foo', namespace: 'bar' })).rejects.toThrow(
          ERROR_NAMESPACE_SPECIFIED
        );
      });

      test(`passes options.type to baseClient if valid singular type specified`, async () => {
        const { client, baseClient } = await createSpacesSavedObjectsClient();
        const expectedReturnValue = {
          saved_objects: [createMockResponse()],
          total: 1,
          per_page: 0,
          page: 0,
        };
        baseClient.find.mockReturnValue(Promise.resolve(expectedReturnValue));

        const options = Object.freeze({ type: 'foo' });
        const actualReturnValue = await client.find(options);

        expect(actualReturnValue).toBe(expectedReturnValue);
        expect(baseClient.find).toHaveBeenCalledWith({
          type: ['foo'],
          namespace: currentSpace.expectedNamespace,
        });
      });

      test(`supplements options with the current namespace`, async () => {
        const { client, baseClient } = await createSpacesSavedObjectsClient();
        const expectedReturnValue = {
          saved_objects: [createMockResponse()],
          total: 1,
          per_page: 0,
          page: 0,
        };
        baseClient.find.mockReturnValue(Promise.resolve(expectedReturnValue));

        const options = Object.freeze({ type: ['foo', 'bar'] });
        const actualReturnValue = await client.find(options);

        expect(actualReturnValue).toBe(expectedReturnValue);
        expect(baseClient.find).toHaveBeenCalledWith({
          type: ['foo', 'bar'],
          namespace: currentSpace.expectedNamespace,
        });
      });
    });

    describe('#create', () => {
      test(`throws error if options.namespace is specified`, async () => {
        const { client } = await createSpacesSavedObjectsClient();

        await expect(client.create('foo', {}, { namespace: 'bar' })).rejects.toThrow(
          ERROR_NAMESPACE_SPECIFIED
        );
      });

      test(`supplements options with the current namespace`, async () => {
        const { client, baseClient } = await createSpacesSavedObjectsClient();
        const expectedReturnValue = createMockResponse();
        baseClient.create.mockReturnValue(Promise.resolve(expectedReturnValue));

        const type = Symbol();
        const attributes = Symbol();
        const options = Object.freeze({ foo: 'bar' });
        // @ts-ignore
        const actualReturnValue = await client.create(type, attributes, options);

        expect(actualReturnValue).toBe(expectedReturnValue);
        expect(baseClient.create).toHaveBeenCalledWith(type, attributes, {
          foo: 'bar',
          namespace: currentSpace.expectedNamespace,
        });
      });
    });

    describe('#bulkCreate', () => {
      test(`throws error if options.namespace is specified`, async () => {
        const { client } = await createSpacesSavedObjectsClient();

        await expect(
          client.bulkCreate([{ id: '', type: 'foo', attributes: {} }], { namespace: 'bar' })
        ).rejects.toThrow(ERROR_NAMESPACE_SPECIFIED);
      });

      test(`supplements options with the current namespace`, async () => {
        const { client, baseClient } = await createSpacesSavedObjectsClient();
        const expectedReturnValue = { saved_objects: [createMockResponse()] };
        baseClient.bulkCreate.mockReturnValue(Promise.resolve(expectedReturnValue));

        const objects = [{ type: 'foo' }];
        const options = Object.freeze({ foo: 'bar' });
        // @ts-ignore
        const actualReturnValue = await client.bulkCreate(objects, options);

        expect(actualReturnValue).toBe(expectedReturnValue);
        expect(baseClient.bulkCreate).toHaveBeenCalledWith(objects, {
          foo: 'bar',
          namespace: currentSpace.expectedNamespace,
        });
      });
    });

    describe('#update', () => {
      test(`throws error if options.namespace is specified`, async () => {
        const { client } = await createSpacesSavedObjectsClient();

        await expect(
          // @ts-ignore
          client.update(null, null, null, { namespace: 'bar' })
        ).rejects.toThrow(ERROR_NAMESPACE_SPECIFIED);
      });

      test(`supplements options with the current namespace`, async () => {
        const { client, baseClient } = await createSpacesSavedObjectsClient();
        const expectedReturnValue = createMockResponse();
        baseClient.update.mockReturnValue(Promise.resolve(expectedReturnValue));

        const type = Symbol();
        const id = Symbol();
        const attributes = Symbol();
        const options = Object.freeze({ foo: 'bar' });
        // @ts-ignore
        const actualReturnValue = await client.update(type, id, attributes, options);

        expect(actualReturnValue).toBe(expectedReturnValue);
        expect(baseClient.update).toHaveBeenCalledWith(type, id, attributes, {
          foo: 'bar',
          namespace: currentSpace.expectedNamespace,
        });
      });
    });

    describe('#bulkUpdate', () => {
      test(`throws error if options.namespace is specified`, async () => {
        const { client } = await createSpacesSavedObjectsClient();

        await expect(
          // @ts-ignore
          client.bulkUpdate(null, { namespace: 'bar' })
        ).rejects.toThrow(ERROR_NAMESPACE_SPECIFIED);
      });

      test(`supplements options with the current namespace`, async () => {
        const { client, baseClient } = await createSpacesSavedObjectsClient();
        const expectedReturnValue = { saved_objects: [createMockResponse()] };
        baseClient.bulkUpdate.mockReturnValue(Promise.resolve(expectedReturnValue));

        const actualReturnValue = await client.bulkUpdate([
          { id: 'id', type: 'foo', attributes: {}, references: [] },
        ]);

        expect(actualReturnValue).toBe(expectedReturnValue);
        expect(baseClient.bulkUpdate).toHaveBeenCalledWith(
          [
            {
              id: 'id',
              type: 'foo',
              attributes: {},
              references: [],
            },
          ],
          { namespace: currentSpace.expectedNamespace }
        );
      });
    });

    describe('#delete', () => {
      test(`throws error if options.namespace is specified`, async () => {
        const { client } = await createSpacesSavedObjectsClient();

        await expect(
          // @ts-ignore
          client.delete(null, null, { namespace: 'bar' })
        ).rejects.toThrow(ERROR_NAMESPACE_SPECIFIED);
      });

      test(`supplements options with the current namespace`, async () => {
        const { client, baseClient } = await createSpacesSavedObjectsClient();
        const expectedReturnValue = createMockResponse();
        baseClient.delete.mockReturnValue(Promise.resolve(expectedReturnValue));

        const type = Symbol();
        const id = Symbol();
        const options = Object.freeze({ foo: 'bar' });
        // @ts-ignore
        const actualReturnValue = await client.delete(type, id, options);

        expect(actualReturnValue).toBe(expectedReturnValue);
        expect(baseClient.delete).toHaveBeenCalledWith(type, id, {
          foo: 'bar',
          namespace: currentSpace.expectedNamespace,
        });
      });
    });

    describe('#addToNamespaces', () => {
      test(`throws error if options.namespace is specified`, async () => {
        const { client } = await createSpacesSavedObjectsClient();

        await expect(
          // @ts-ignore
          client.addToNamespaces(null, null, null, { namespace: 'bar' })
        ).rejects.toThrow(ERROR_NAMESPACE_SPECIFIED);
      });

      test(`supplements options with the current namespace`, async () => {
        const { client, baseClient } = await createSpacesSavedObjectsClient();
        const expectedReturnValue = createMockResponse();
        baseClient.addToNamespaces.mockReturnValue(Promise.resolve(expectedReturnValue));

        const type = Symbol();
        const id = Symbol();
        const namespaces = Symbol();
        const options = Object.freeze({ foo: 'bar' });
        // @ts-ignore
        const actualReturnValue = await client.addToNamespaces(type, id, namespaces, options);

        expect(actualReturnValue).toBe(expectedReturnValue);
        expect(baseClient.addToNamespaces).toHaveBeenCalledWith(type, id, namespaces, {
          foo: 'bar',
          namespace: currentSpace.expectedNamespace,
        });
      });
    });

    describe('#deleteFromNamespaces', () => {
      test(`throws error if options.namespace is specified`, async () => {
        const { client } = await createSpacesSavedObjectsClient();

        await expect(
          // @ts-ignore
          client.deleteFromNamespaces(null, null, null, { namespace: 'bar' })
        ).rejects.toThrow(ERROR_NAMESPACE_SPECIFIED);
      });

      test(`supplements options with the current namespace`, async () => {
        const { client, baseClient } = await createSpacesSavedObjectsClient();
        const expectedReturnValue = createMockResponse();
        baseClient.deleteFromNamespaces.mockReturnValue(Promise.resolve(expectedReturnValue));

        const type = Symbol();
        const id = Symbol();
        const namespaces = Symbol();
        const options = Object.freeze({ foo: 'bar' });
        // @ts-ignore
        const actualReturnValue = await client.deleteFromNamespaces(type, id, namespaces, options);

        expect(actualReturnValue).toBe(expectedReturnValue);
        expect(baseClient.deleteFromNamespaces).toHaveBeenCalledWith(type, id, namespaces, {
          foo: 'bar',
          namespace: currentSpace.expectedNamespace,
        });
      });
    });
  });
});
