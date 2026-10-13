import { test, expect } from '@playwright/test';

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

const hasPostShape = {
  userId: expect.any(Number),
  id: expect.any(Number),
  title: expect.any(String),
  body: expect.any(String),
};

test.describe('Posts API', () => {
  test('GET /posts returns the collection @smoke', async ({ request }) => {
    const response = await request.get('/posts');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const posts: Post[] = await response.json();
    expect(posts).toHaveLength(100);
    expect(posts[0]).toMatchObject(hasPostShape);
  });

  test('GET /posts/:id returns a single post with the expected schema @smoke', async ({
    request,
  }) => {
    const response = await request.get('/posts/1');
    expect(response.ok()).toBeTruthy();
    expect(await response.json()).toMatchObject({ ...hasPostShape, id: 1 });
  });

  test('GET /posts?userId filters by author', async ({ request }) => {
    const response = await request.get('/posts', { params: { userId: 3 } });
    const posts: Post[] = await response.json();
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) expect(post.userId).toBe(3);
  });

  test('GET /posts/:id/comments returns the comments of that post', async ({ request }) => {
    const response = await request.get('/posts/1/comments');
    const comments: Array<{ postId: number; email: string }> = await response.json();
    expect(comments.length).toBeGreaterThan(0);
    for (const comment of comments) {
      expect(comment.postId).toBe(1);
      expect(comment.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    }
  });

  test('POST /posts creates a resource and echoes the payload @smoke', async ({ request }) => {
    const payload = { title: 'release notes', body: 'regression suite is green', userId: 7 };
    const response = await request.post('/posts', { data: payload });
    expect(response.status()).toBe(201);
    expect(await response.json()).toMatchObject({ ...payload, id: expect.any(Number) });
  });

  test('PUT /posts/:id replaces the resource', async ({ request }) => {
    const payload = { id: 1, title: 'replaced', body: 'new body', userId: 1 };
    const response = await request.put('/posts/1', { data: payload });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(payload);
  });

  test('PATCH /posts/:id changes only the fields sent', async ({ request }) => {
    const response = await request.patch('/posts/1', { data: { title: 'patched' } });
    expect(response.status()).toBe(200);
    const post: Post = await response.json();
    expect(post.title).toBe('patched');
    expect(post.body).toEqual(expect.any(String));
    expect(post.userId).toBe(1);
  });

  test('DELETE /posts/:id succeeds', async ({ request }) => {
    const response = await request.delete('/posts/1');
    expect(response.status()).toBe(200);
  });

  test('GET an id that does not exist returns 404', async ({ request }) => {
    const response = await request.get('/posts/999999');
    expect(response.status()).toBe(404);
  });

  test('GET a malformed id does not return a post', async ({ request }) => {
    const response = await request.get('/posts/not-a-number');
    expect(response.status()).toBe(404);
  });

  test('responds fast enough for a smoke check', async ({ request }) => {
    const started = Date.now();
    const response = await request.get('/posts/1');
    const elapsed = Date.now() - started;
    expect(response.ok()).toBeTruthy();
    expect(elapsed).toBeLessThan(3_000);
  });
});
