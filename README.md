Forked from:
- [NomadRazor/dbdiagram-oss-wrep](https://github.com/NomadRazor/dbdiagram-oss-wrep/fork)
- [TruDan/dbdiagram-oss](https://github.com/TruDan/dbdiagram-oss)

# DB Diagram OSS (dbdiagram-oss)

An Open Source solution for designing DB diagrams based on [DBML](https://dbml.dbdiagram.io/home/) (Database Markup Language).
Initally this fork is intended for my personal usage but feel free to use it.

## Start app:
`docker-compose up -d --build`



## Start in dev mode:
```bash
yarn
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```

### Lint the files
```bash
yarn lint
```

### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).

## Sample DBML:

```
Table main.users [headercolor: #5552ba] {
    id integer [primary key, not null, unique]
    username varchar
    role varchar [default: 'reader']
    created_at timestamp [default: `now()`]
    
    indexes {
      id
      username
    }
}

Table posts [headercolor: #d35400] {
    id integer [primary key]
    title varchar
    body text [note: 'Content of the post']
    user_id integer
    created_at timestamp
}

Table comments {
  id integram [primary key]
  title varchar
  body text
  user_id integer
  post_id integer
  created_at integer
}


Table user_log {
  id integer [primary key]
  user_id integer
  type actions.types [note: 'Type of user action']
  indexes {
    user_id
  }
}


Table admin {
  id integer [primary key]
  user_id integer
  type admin.types
}


Enum actions.types {
  new_post
  new_comment
  new_visit
}

Enum admin.types {
  moderator
  global_admin
  community_admin
}


Ref: posts.user_id > main.users.id // many-to-one
Ref: user_log.user_id > main.users.id // many-to-one
Ref: comments.post_id < posts.id // many-to-many
Ref: comments.user_id > main.users.id // many-to-one
Ref: admin.user_id - main.users.id // one to one


TableGroup "User"  {
  main.users
  admin
}


TableGroup "User Actions"  {
  posts
  comments
  user_log
}

```