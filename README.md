# sequelize-activitylog

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][codecov-image]][codecov-url]

> A sequelize plugin for logging activities

## Install

```
$ npm install --save sequelize-activitylog
```

## Usage

### Define the Activity model

Create `Activity` model named `activity_log` and then use the model methods.

```js
const Sequelize = require('sequelize')
const activitylog = require('sequelize-activitylog')
const Activity = activitylog(sequelize, { modelName: 'activity_log' })
```

### Log an activity

This is the most basic way to log activity:

```js
await new Activity().log('Look mum, I logged something')
```

You can retrieve the activity using the Activity model.

```js
const activity = await Activity.findOne({ order: [ ['created_at', 'DESC'] ] }) // returns the last logged activity
activity.description // returns 'Look mum, I logged something'
```

### Set a subject

You can specify on which object the activity is performed by using `performedOn`:

```js
await new Activity()
  .performedOn(someContentModel)
  .log('edited')

const activity = await Activity.findOne({ order: [ ['created_at', 'DESC'] ] }) // returns the last logged activity
activity.getSubject() // returns the model that was passed to `performedOn`
```

The `performedOn()` function has a shorter alias name: `on`

### Set a causer

You can set who or what caused the activity by using `causedBy`:

```js
await new Activity()
  .performedOn(someContentModel)
  .causedBy(userModel)
  .log('edited')

const activity = await Activity.findOne({ order: [ ['created_at', 'DESC'] ] }) // returns the last logged activity
activity.getCauser() // returns the model that was passed to `causedBy`
```

The `causedBy()` function has a shorter alias named: `by`

### Set custom properties

You can add any property you want to an activity by using `withProperties`:

```js
await new Activity()
  .performedOn(someContentModel)
  .causedBy(userModel)
  .withProperties({ key: 'value' })
  .log('edited')

const activity = await Activity.findOne({ order: [ ['created_at', 'DESC'] ] }) // returns the last logged activity
activity.properties // returns `{ key: 'value' }`
activity.getExtraProperty('key') // returns 'value'
```

The `withProperties()` function has a shorter alias named: `with`

## API

- [log()](#log)
- [performedOn()](#performedon)
- [causedBy()](#causedby)
- [withProperties()](#withproperties)
- [withProperty()](#withproperty)
- [useLog()](#uselog)
- [use()](#use)
- [on()](#on)
- [by()](#by)
- [with()](#with)

### log()

```js
log(description: string): Promise
```

Log an activity.

### performedOn()

```js
performedOn(model: Model): this
```

Specify on which object the activity is performed.

### causedBy()

```js
causedBy(model: Model): this
```

Set who or what caused the activity.

### withProperties()

```js
withProperties(properties: object): this
```

Add properties to the activity.

### withProperty()

```js
withProperty(key: string, value: any): this
```

Add a property to the activity by key.

### useLog()

```js
useLog(logName: string): this
```

Specify log name of the activity.

### use()

```js
use(logName: string): this
```

Alias of `useLog()`.

### on()

```js
on(model: Model): this
```

Alias of `performedOn()`.

### by()

```js
by(model: Model): this
```

Alias of `causedBy()`.

### with()

```js
with(properties: object): this
with(key: string, value: any): this
```

Alias of `withProperties()` / `withProperty()`.

## Note

Inspired by [laravel-activitylog](https://github.com/spatie/laravel-activitylog)

## License

MIT © [Chun-Kai Wang](https://github.com/chunkai1312)

[npm-image]: https://img.shields.io/npm/v/sequelize-activitylog.svg
[npm-url]: https://npmjs.org/package/sequelize-activitylog
[travis-image]: https://img.shields.io/travis/chunkai1312/sequelize-activitylog.svg
[travis-url]: https://travis-ci.org/chunkai1312/sequelize-activitylog
[codecov-image]: https://img.shields.io/codecov/c/github/chunkai1312/sequelize-activitylog.svg
[codecov-url]: https://codecov.io/gh/chunkai1312/sequelize-activitylog
