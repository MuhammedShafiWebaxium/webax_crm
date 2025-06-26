const ROLES = {
  'Super Admin': {
    companies: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    users: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    leads: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    todos: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
  },
  Admin: {
    users: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    leads: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    todos: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
  },
  moderator: {
    comments: {
      view: true,
      create: true,
      update: true,
    },
    todos: {
      view: true,
      create: true,
      update: true,
      delete: (user, todo) => todo.completed,
    },
  },
  user: {
    comments: {
      view: (user, comment) => !user.blockedBy.includes(comment.authorId),
      create: true,
      update: (user, comment) => comment.authorId === user.id,
    },
    todos: {
      view: (user, todo) => !user.blockedBy.includes(todo.userId),
      create: true,
      update: (user, todo) =>
        todo.userId === user.id || todo.invitedUsers.includes(user.id),
      delete: (user, todo) =>
        (todo.userId === user.id || todo.invitedUsers.includes(user.id)) &&
        todo.completed,
    },
  },
};

function hasPermission(user, resource, action, data) {
  return user.roles.some((role) => {
    const permission = ROLES[role]?.[resource]?.[action];
    if (permission == null) return false;
    if (typeof permission === 'boolean') return permission;
    return data != null && permission(user, data);
  });
}

// USAGE:
const user = { blockedBy: ['2'], id: '1', roles: ['user'] };
const todo = {
  completed: false,
  id: '3',
  invitedUsers: [],
  title: 'Test Todo',
  userId: '1',
};

// Can create a comment
console.log(hasPermission(user, 'comments', 'create'));

// Can view the `todo` Todo
console.log(hasPermission(user, 'todos', 'view', todo));

// Can view all todos
console.log(hasPermission(user, 'todos', 'view'));
