import 'mocha';
import {assert, should} from 'chai';
import {Codec} from "../src/codec";
import * as search from "./proto/search.js";

class SearchRequestCodec implements Codec<search.SearchRequest> {
  create(obj?: any[]): search.SearchRequest {
    return new search.SearchRequest(obj);
  }

  decode(bytes: Uint8Array): search.SearchRequest {
    return search.SearchRequest.deserializeBinary(bytes);
  }

  encode(obj: search.SearchRequest): Uint8Array {
    return obj.serializeBinary();
  }

  isValid(obj: any[]): boolean {
    return true;
  }
}

describe("SearchRequest protobuf tests", () => {
  const codec = new SearchRequestCodec();

  it('should construct a new instance using an array', () => {
      const query = 'hello, query';
      const obj = codec.create([query]);

      assert.equal(obj.getQuery(), query);
    }
  );

  it('should construct a new instance using a setter', () => {
      const obj = codec.create();
      const pageNumber = 42;
      obj.setPageNumber(pageNumber);

      assert.equal(obj.getPageNumber(), pageNumber);
    }
  );

  it('should encode and decode to an equal object', () => {
      const params = ['query', 42, 666];

      const obj = codec.create(params);
      const bytes = codec.encode(obj);
      const decoded = codec.decode(bytes);

      assert.deepEqual(decoded, obj);
    }
  );
});
