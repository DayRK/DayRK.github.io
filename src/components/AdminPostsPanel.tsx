'use client';

import { useCallback, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleExclamation, faFloppyDisk, faPenToSquare, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, Card, CardBody, Chip, Input, Select, SelectItem, Switch, Textarea } from '@heroui/react';

type PostItem = {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  kind: 'blog' | 'research';
  tags: string[];
  published: boolean;
};

type AdminPostsPanelProps = Record<string, never>;

const emptyPost: PostItem = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  kind: 'blog',
  tags: [],
  published: false,
};

const inputClass = 'bg-slate-800/80 border border-white/10';

export default function AdminPostsPanel(_props: AdminPostsPanelProps) {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [newPost, setNewPost] = useState<PostItem>(emptyPost);
  const [newTags, setNewTags] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [editingTags, setEditingTags] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; tone: 'success' | 'error' } | null>(null);

  const headers = useCallback(
    () => ({
      'Content-Type': 'application/json',
    }),
    []
  );

  useEffect(() => {
    if (!statusMessage) return;

    const timer = window.setTimeout(() => {
      setStatusMessage(null);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  const loadPosts = useCallback(async () => {
    try {
      const response = await fetch('/api/posts', { headers: headers() });
      if (!response.ok) throw new Error('Failed to fetch posts');
      setPosts(await response.json());
    } catch {
      setStatusMessage({ text: 'Could not load posts.', tone: 'error' });
    }
  }, [headers]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const send = async (
    url: string,
    method: 'POST' | 'PUT' | 'DELETE',
    body?: unknown
  ): Promise<{ ok: boolean; error?: string }> => {
    const response = await fetch(url, {
      method,
      headers: headers(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { ok: false, error: (data as { error?: string }).error || 'Request failed' };
    }

    return { ok: true };
  };

  const parseTags = (value: string) =>
    value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

  const addPost = async () => {
    if (!newPost.title || !newPost.excerpt || !newPost.content) {
      setStatusMessage({ text: 'Complete the title, excerpt and content first.', tone: 'error' });
      return;
    }

    const result = await send('/api/posts', 'POST', { ...newPost, tags: parseTags(newTags) });
    if (!result.ok) {
      setStatusMessage({ text: result.error || 'Could not add post.', tone: 'error' });
      return;
    }

    setNewPost(emptyPost);
    setNewTags('');
    loadPosts();
    setStatusMessage({ text: 'Post added successfully.', tone: 'success' });
  };

  const updatePostItem = async () => {
    if (!editingPost || !editingId) return;

    const result = await send(`/api/posts/${editingId}`, 'PUT', {
      ...editingPost,
      tags: parseTags(editingTags),
    });
    if (!result.ok) {
      setStatusMessage({ text: result.error || 'Could not update post.', tone: 'error' });
      return;
    }

    setEditingId(null);
    setEditingPost(null);
    setEditingTags('');
    loadPosts();
    setStatusMessage({ text: 'Post updated successfully.', tone: 'success' });
  };

  const removePost = async (id: number) => {
    if (!confirm('Delete this post?')) return;

    const result = await send(`/api/posts/${id}`, 'DELETE');
    if (!result.ok) {
      setStatusMessage({ text: result.error || 'Could not delete post.', tone: 'error' });
      return;
    }

    loadPosts();
    setStatusMessage({ text: 'Post removed successfully.', tone: 'success' });
  };

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div className={`flex items-start gap-3 rounded-[1.25rem] border px-4 py-3 shadow-[0_10px_30px_rgba(4,2,16,0.18)] animate-[fadeIn_0.25s_ease-out] ${statusMessage.tone === 'success' ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200' : 'border-red-500/40 bg-red-500/10 text-red-200'}`}>
          {statusMessage.tone === 'success' ? <FontAwesomeIcon icon={faCircleCheck} className="mt-0.5 shrink-0" /> : <FontAwesomeIcon icon={faCircleExclamation} className="mt-0.5 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <Card className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 shadow-[0_20px_60px_rgba(4,2,16,0.35)]">
        <CardBody className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Blog & Research</h2>
              <p className="mt-1 text-sm text-slate-400">Posts are private until you publish them.</p>
            </div>
            <Chip variant="flat" className="border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-300">
              {posts.length} posts
            </Chip>
          </div>

          <div className="space-y-4 rounded-[1.25rem] border border-white/10 bg-slate-950/40 p-4">
            <Input
              label="Title"
              labelPlacement="outside"
              placeholder="Building a portfolio CMS"
              value={newPost.title}
              onValueChange={(value) => setNewPost({ ...newPost, title: value })}
              classNames={{ inputWrapper: inputClass }}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                label="Type"
                labelPlacement="outside"
                selectedKeys={[newPost.kind]}
                onChange={(event) => setNewPost({ ...newPost, kind: event.target.value as PostItem['kind'] })}
                classNames={{ trigger: inputClass }}
              >
                <SelectItem key="blog">Blog</SelectItem>
                <SelectItem key="research">Research</SelectItem>
              </Select>
              <Input
                label="Slug (optional)"
                labelPlacement="outside"
                placeholder="auto-from-title"
                value={newPost.slug}
                onValueChange={(value) => setNewPost({ ...newPost, slug: value })}
                classNames={{ inputWrapper: inputClass }}
              />
            </div>
            <Textarea
              label="Excerpt"
              labelPlacement="outside"
              placeholder="Short summary shown on the blog list"
              minRows={2}
              value={newPost.excerpt}
              onValueChange={(value) => setNewPost({ ...newPost, excerpt: value })}
              classNames={{ inputWrapper: inputClass }}
            />
            <Textarea
              label="Content"
              labelPlacement="outside"
              placeholder="Write the full post here"
              minRows={6}
              value={newPost.content}
              onValueChange={(value) => setNewPost({ ...newPost, content: value })}
              classNames={{ inputWrapper: inputClass }}
            />
            <Input
              label="Tags"
              labelPlacement="outside"
              description="Comma separated, e.g. nextjs, supabase"
              value={newTags}
              onValueChange={setNewTags}
              classNames={{ inputWrapper: inputClass }}
            />
            <Switch
              isSelected={newPost.published}
              onValueChange={(isSelected) => setNewPost({ ...newPost, published: isSelected })}
            >
              <span className="text-sm text-slate-300">Publish immediately</span>
            </Switch>
            <Button color="secondary" fullWidth startContent={<FontAwesomeIcon icon={faPlus} />} onPress={addPost} className="font-medium">
              Add post
            </Button>
          </div>

          <div className="mt-5 space-y-3">
            {posts.map((item) => (
              <div key={item.id ?? item.slug} className="rounded-[1.25rem] border border-white/10 bg-slate-950/40 p-4">
                {editingId === item.id && editingPost ? (
                  <div className="space-y-3">
                    <Input
                      aria-label="Edit title"
                      label="Title"
                      labelPlacement="outside"
                      value={editingPost.title}
                      onValueChange={(value) => setEditingPost({ ...editingPost, title: value })}
                      classNames={{ inputWrapper: inputClass }}
                    />
                    <Select
                      aria-label="Edit type"
                      label="Type"
                      labelPlacement="outside"
                      selectedKeys={[editingPost.kind]}
                      onChange={(event) => setEditingPost({ ...editingPost, kind: event.target.value as PostItem['kind'] })}
                      classNames={{ trigger: inputClass }}
                    >
                      <SelectItem key="blog">Blog</SelectItem>
                      <SelectItem key="research">Research</SelectItem>
                    </Select>
                    <Input
                      aria-label="Edit slug"
                      label="Slug"
                      labelPlacement="outside"
                      value={editingPost.slug}
                      onValueChange={(value) => setEditingPost({ ...editingPost, slug: value })}
                      classNames={{ inputWrapper: inputClass }}
                    />
                    <Textarea
                      aria-label="Edit excerpt"
                      label="Excerpt"
                      labelPlacement="outside"
                      minRows={2}
                      value={editingPost.excerpt}
                      onValueChange={(value) => setEditingPost({ ...editingPost, excerpt: value })}
                      classNames={{ inputWrapper: inputClass }}
                    />
                    <Textarea
                      aria-label="Edit content"
                      label="Content"
                      labelPlacement="outside"
                      minRows={6}
                      value={editingPost.content}
                      onValueChange={(value) => setEditingPost({ ...editingPost, content: value })}
                      classNames={{ inputWrapper: inputClass }}
                    />
                    <Input
                      aria-label="Edit tags"
                      label="Tags"
                      labelPlacement="outside"
                      description="Comma separated"
                      value={editingTags}
                      onValueChange={setEditingTags}
                      classNames={{ inputWrapper: inputClass }}
                    />
                    <Switch
                      isSelected={editingPost.published}
                      onValueChange={(isSelected) => setEditingPost({ ...editingPost, published: isSelected })}
                    >
                      <span className="text-sm text-slate-300">Published</span>
                    </Switch>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button color="success" startContent={<FontAwesomeIcon icon={faFloppyDisk} />} onPress={updatePostItem} className="flex-1 font-medium">
                        Save
                      </Button>
                      <Button color="default" className="flex-1 font-medium" onPress={() => { setEditingId(null); setEditingPost(null); setEditingTags(''); }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                        <p className="mt-1 text-sm text-slate-400">/{item.slug}</p>
                      </div>
                      <Chip
                        size="sm"
                        variant="flat"
                        className={item.published ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-700 text-slate-300'}
                      >
                        {item.published ? 'Published' : 'Draft'}
                      </Chip>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-300">{item.excerpt}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Chip size="sm" variant="flat" className="bg-fuchsia-500/20 text-fuchsia-200">
                        {item.kind === 'research' ? 'Research' : 'Blog'}
                      </Chip>
                      {item.tags.map((tag) => (
                        <Chip key={tag} size="sm" variant="flat" className="bg-slate-700 text-slate-300">
                          {tag}
                        </Chip>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Button
                        color="primary"
                        startContent={<FontAwesomeIcon icon={faPenToSquare} />}
                        onPress={() => {
                          setEditingId(item.id ?? null);
                          setEditingPost(item);
                          setEditingTags(item.tags.join(', '));
                        }}
                        className="flex-1 font-medium"
                      >
                        Edit
                      </Button>
                      <Button color="danger" startContent={<FontAwesomeIcon icon={faTrash} />} onPress={() => removePost(item.id || 0)} className="flex-1 font-medium">
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
