/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */


import {Provider, TOGGLE_CONNECT_COMMAND} from '@lexical/yjs';
import {COMMAND_PRIORITY_LOW} from 'lexical';
import {useEffect, useState} from 'react';
import {
  Array as YArray,
  Map as YMap,
  Transaction,
  YArrayEvent,
  YEvent,
} from 'yjs';


function createUID() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 5);
}

export function createComment(
  content,
  author,
  id,
  timeStamp,
  deleted,
) {
  return {
    author,
    content,
    deleted: deleted === undefined ? false : deleted,
    id: id === undefined ? createUID() : id,
    timeStamp: timeStamp === undefined ? performance.now() : timeStamp,
    type: 'comment',
  };
}

export function createThread(
  quote,
  comments,
  id,
) {
  return {
    comments,
    id: id === undefined ? createUID() : id,
    quote,
    type: 'thread',
  };
}

function cloneThread(thread) {
  return {
    comments: Array.from(thread.comments),
    id: thread.id,
    quote: thread.quote,
    type: 'thread',
  };
}

function markDeleted(comment) {
  return {
    author: comment.author,
    content: '[Deleted Comment]',
    deleted: true,
    id: comment.id,
    timeStamp: comment.timeStamp,
    type: 'comment',
  };
}

function triggerOnChange(commentStore) {
  const listeners = commentStore._changeListeners;
  for (const listener of listeners) {
    listener();
  }
}

export class CommentStore {
  constructor(editor) {
    this._comments = [];
    this._editor = editor;
    this._collabProvider = null;
    this._changeListeners = new Set();
  }

  isCollaborative() {
    return this._collabProvider !== null;
  }

  getComments() {
    return this._comments;
  }

  addComment(
    commentOrThread,
    thread,
    offset,
  ) {
    const nextComments = Array.from(this._comments);
    // The YJS types explicitly use `any` as well.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sharedCommentsArray = this._getCollabComments();

    if (thread !== undefined && commentOrThread.type === 'comment') {
      for (let i = 0; i < nextComments.length; i++) {
        const comment = nextComments[i];
        if (comment.type === 'thread' && comment.id === thread.id) {
          const newThread = cloneThread(comment);
          nextComments.splice(i, 1, newThread);
          const insertOffset =
            offset !== undefined ? offset : newThread.comments.length;
          if (this.isCollaborative() && sharedCommentsArray !== null) {
            const parentSharedArray = sharedCommentsArray
              .get(i)
              .get('comments');
            this._withRemoteTransaction(() => {
              const sharedMap = this._createCollabSharedMap(commentOrThread);
              parentSharedArray.insert(insertOffset, [sharedMap]);
            });
          }
          newThread.comments.splice(insertOffset, 0, commentOrThread);
          break;
        }
      }
    } else {
      const insertOffset = offset !== undefined ? offset : nextComments.length;
      if (this.isCollaborative() && sharedCommentsArray !== null) {
        this._withRemoteTransaction(() => {
          const sharedMap = this._createCollabSharedMap(commentOrThread);
          sharedCommentsArray.insert(insertOffset, [sharedMap]);
        });
      }
      nextComments.splice(insertOffset, 0, commentOrThread);
    }
    this._comments = nextComments;
    triggerOnChange(this);
  }

  deleteCommentOrThread(
    commentOrThread,
    thread,
  ) {
    const nextComments = Array.from(this._comments);
    // The YJS types explicitly use `any` as well.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sharedCommentsArray = this._getCollabComments();
    let commentIndex = null;

    if (thread !== undefined) {
      for (let i = 0; i < nextComments.length; i++) {
        const nextComment = nextComments[i];
        if (nextComment.type === 'thread' && nextComment.id === thread.id) {
          const newThread = cloneThread(nextComment);
          nextComments.splice(i, 1, newThread);
          const threadComments = newThread.comments;
          commentIndex = threadComments.indexOf(commentOrThread );
          if (this.isCollaborative() && sharedCommentsArray !== null) {
            const parentSharedArray = sharedCommentsArray
              .get(i)
              .get('comments');
            this._withRemoteTransaction(() => {
              parentSharedArray.delete(commentIndex);
            });
          }
          threadComments.splice(commentIndex, 1);
          break;
        }
      }
    } else {
      commentIndex = nextComments.indexOf(commentOrThread);
      if (this.isCollaborative() && sharedCommentsArray !== null) {
        this._withRemoteTransaction(() => {
          sharedCommentsArray.delete(commentIndex);
        });
      }
      nextComments.splice(commentIndex, 1);
    }
    this._comments = nextComments;
    triggerOnChange(this);

    if (commentOrThread.type === 'comment') {
      return {
        index: commentIndex ,
        markedComment: markDeleted(commentOrThread ),
      };
    }

    return null;
  }

  registerOnChange(onChange) {
    const changeListeners = this._changeListeners;
    changeListeners.add(onChange);
    return () => {
      changeListeners.delete(onChange);
    };
  }

  _withRemoteTransaction(fn) {
    const provider = this._collabProvider;
    if (provider !== null) {
      // @ts-ignore doc does exist
      const doc = provider.doc;
      doc.transact(fn, this);
    }
  }

  _withLocalTransaction(fn) {
    const collabProvider = this._collabProvider;
    try {
      this._collabProvider = null;
      fn();
    } finally {
      this._collabProvider = collabProvider;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _getCollabComments() {
    const provider = this._collabProvider;
    if (provider !== null) {
      // @ts-ignore doc does exist
      const doc = provider.doc;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return doc.get('comments', YArray) ;
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _createCollabSharedMap(commentOrThread) {
    const sharedMap = new YMap();
    const type = commentOrThread.type;
    const id = commentOrThread.id;
    sharedMap.set('type', type);
    sharedMap.set('id', id);
    if (type === 'comment') {
      sharedMap.set('author', commentOrThread.author);
      sharedMap.set('content', commentOrThread.content);
      sharedMap.set('deleted', commentOrThread.deleted);
      sharedMap.set('timeStamp', commentOrThread.timeStamp);
    } else {
      sharedMap.set('quote', commentOrThread.quote);
      const commentsArray = new YArray();
      commentOrThread.comments.forEach((comment, i) => {
        const sharedChildComment = this._createCollabSharedMap(comment);
        commentsArray.insert(i, [sharedChildComment]);
      });
      sharedMap.set('comments', commentsArray);
    }
    return sharedMap;
  }

  registerCollaboration(provider){
    this._collabProvider = provider;
    const sharedCommentsArray = this._getCollabComments();

    const connect = () => {
      provider.connect();
    };

    const disconnect = () => {
      try {
        provider.disconnect();
      } catch (e) {
        // Do nothing
      }
    };

    const unsubscribe = this._editor.registerCommand(
      TOGGLE_CONNECT_COMMAND,
      (payload) => {
        if (connect !== undefined && disconnect !== undefined) {
          const shouldConnect = payload;

          if (shouldConnect) {
            // eslint-disable-next-line no-console
            console.log('Comments connected!');
            connect();
          } else {
            // eslint-disable-next-line no-console
            console.log('Comments disconnected!');
            disconnect();
          }
        }

        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    const onSharedCommentChanges = (
      // The YJS types explicitly use `any` as well.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      events,
      transaction,
    ) => {
      if (transaction.origin !== this) {
        for (let i = 0; i < events.length; i++) {
          const event = events[i];

          if (event instanceof YArrayEvent) {
            const target = event.target;
            const deltas = event.delta;
            let offset = 0;

            for (let s = 0; s < deltas.length; s++) {
              const delta = deltas[s];
              const insert = delta.insert;
              const retain = delta.retain;
              const del = delta.delete;
              const parent = target.parent;
              const parentThread =
                target === sharedCommentsArray
                  ? undefined
                  : parent instanceof YMap &&
                    (this._comments.find((t) => t.id === parent.get('id')) );

              if (Array.isArray(insert)) {
                insert
                  .slice()
                  .reverse()
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .forEach((map) => {
                    const id = map.get('id');
                    const type = map.get('type');

                    const commentOrThread =
                      type === 'thread'
                        ? createThread(
                            map.get('quote'),
                            map
                              .get('comments')
                              .toArray()
                              .map(
                                (
                                  innerComment,
                                ) =>
                                  createComment(
                                    innerComment.get('content'),
                                    innerComment.get('author'),
                                    innerComment.get('id'),
                                    innerComment.get('timeStamp'),
                                    innerComment.get('deleted'),
                                  ),
                              ),
                            id,
                          )
                        : createComment(
                            map.get('content'),
                            map.get('author'),
                            id,
                            map.get('timeStamp'),
                            map.get('deleted'),
                          );
                    this._withLocalTransaction(() => {
                      this.addComment(
                        commentOrThread,
                        parentThread,
                        offset,
                      );
                    });
                  });
              } else if (typeof retain === 'number') {
                offset += retain;
              } else if (typeof del === 'number') {
                for (let d = 0; d < del; d++) {
                  const commentOrThread =
                    parentThread === undefined || parentThread === false
                      ? this._comments[offset]
                      : parentThread.comments[offset];
                  this._withLocalTransaction(() => {
                    this.deleteCommentOrThread(
                      commentOrThread,
                      parentThread,
                    );
                  });
                  offset++;
                }
              }
            }
          }
        }
      }
    };

    if (sharedCommentsArray === null) {
      return () => null;
    }

    sharedCommentsArray.observeDeep(onSharedCommentChanges);

    connect();

    return () => {
      sharedCommentsArray.unobserveDeep(onSharedCommentChanges);
      unsubscribe();
      this._collabProvider = null;
    };
  }
}

export function useCommentStore(commentStore) {
  const [comments, setComments] = useState(
    commentStore.getComments(),
  );

  useEffect(() => {
    return commentStore.registerOnChange(() => {
      setComments(commentStore.getComments());
    });
  }, [commentStore]);

  return comments;
}
