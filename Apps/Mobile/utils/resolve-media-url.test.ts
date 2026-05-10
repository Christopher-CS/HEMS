import { resolveMediaUrl } from './resolve-media-url';

describe('resolveMediaUrl', () => {
  it('joins absolute paths to the backend base URL', () => {
    expect(resolveMediaUrl('http://10.0.2.2:4000', '/audio/sample.mp3')).toBe(
      'http://10.0.2.2:4000/audio/sample.mp3'
    );
  });

  it('strips trailing slash from base URL', () => {
    expect(resolveMediaUrl('http://localhost:4000/', '/audio/a.mp3')).toBe(
      'http://localhost:4000/audio/a.mp3'
    );
  });

  it('passes through http(s) URLs unchanged', () => {
    expect(resolveMediaUrl('http://ignored', 'https://cdn.example/x.mp3')).toBe(
      'https://cdn.example/x.mp3'
    );
  });

  it('joins relative filenames without leading slash', () => {
    expect(resolveMediaUrl('http://127.0.0.1:4000', 'audio/x.mp3')).toBe(
      'http://127.0.0.1:4000/audio/x.mp3'
    );
  });
});
