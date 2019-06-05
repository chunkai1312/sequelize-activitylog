'use strict'

const Sequelize = require('sequelize')
const expect = require('chai').expect
const activitylog = require('../lib')

describe('sequelize-activitylog', () => {
  let sequelize, Post, User, Activity, post, user

  before(() => {
    sequelize = new Sequelize('postgres://postgres:postgres@localhost:5432/postgres')

    Post = sequelize.define('post', {
      title: { type: Sequelize.STRING }
    }, { freezeTableName: false, underscored: true })

    User = sequelize.define('user', {
      name: { type: Sequelize.STRING }
    }, { freezeTableName: false, underscored: true })

    Activity = activitylog(sequelize)

    return sequelize.sync()
  })

  after(() => {
    return sequelize.close()
  })

  beforeEach(async () => {
    post = await new Post({ title: 'new title' }).save()
    user = await new User({ name: 'test user' }).save()
  })

  afterEach(async () => {
    await Post.destroy({ where: {}, truncate: true })
    await User.destroy({ where: {}, truncate: true })
    await Activity.destroy({ where: {}, truncate: true })
  })

  describe('#useLog()', () => {
    it('should use default log name', async () => {
      const activity = new Activity()
      expect(activity.log_name).to.equal('default')
    })

    it('should use specific log name', async () => {
      const activity = new Activity().useLog('other-log')
      expect(activity.log_name).to.equal('other-log')
    })

    it('should have alias #use()', async () => {
      const activity = new Activity().use('other-log')
      expect(activity.log_name).to.equal('other-log')
    })
  })

  describe('#log()', () => {
    it('should log a activity', async () => {
      await new Activity().log('Look mum, I logged something')

      const activity = await Activity.findOne({ order: [ ['created_at', 'DESC'] ] })
      const activities = await Activity.findAll({ order: [ ['created_at', 'DESC'] ] })

      expect(activity).to.eql(activities[0])
      expect(activity.description).to.equal('Look mum, I logged something')
    })
  })

  describe('#performedOn()', () => {
    it('should log a activity with subject', async () => {
      await new Activity()
        .performedOn(post)
        .log('new post')

      const activity = await Activity.findOne({ order: [ ['created_at', 'DESC'] ] })
      const activities = await Activity.findAll({ order: [ ['created_at', 'DESC'] ] })
      const subject = await activity.getSubject()

      expect(activity).to.eql(activities[0])
      expect(activity.description).to.equal('new post')
      expect(subject).to.have.property('title', 'new title')
    })

    it('should have alias #on()', async () => {
      await new Activity()
        .on(post)
        .log('new post')

      const activity = await Activity.findOne({ order: [ ['created_at', 'DESC'] ] })
      const activities = await Activity.findAll({ order: [ ['created_at', 'DESC'] ] })
      const subject = await activity.getSubject()

      expect(activity).to.eql(activities[0])
      expect(activity.description).to.equal('new post')
      expect(subject).to.have.property('title', 'new title')
    })

    it('should ignore to set subject when subject is undefined', async () => {
      expect(new Activity().performedOn().subject).to.be.undefined
    })

    it('should throw error when subject is not a Sequelize.Model instance', async () => {
      expect(() => new Activity().performedOn(null)).to.throw()
    })
  })

  describe('#causedBy()', () => {
    it('should log a activity with causer', async () => {
      await new Activity()
        .performedOn(post)
        .causedBy(user)
        .log('new post')

      const activity = await Activity.findOne({ order: [ ['created_at', 'DESC'] ] })
      const activities = await Activity.findAll({ order: [ ['created_at', 'DESC'] ] })
      const subject = await activity.getSubject()
      const causer = await activity.getCauser()

      expect(activity).to.eql(activities[0])
      expect(activity.description).to.equal('new post')
      expect(subject).to.have.property('title', 'new title')
      expect(causer).to.have.property('name', 'test user')
    })

    it('should have alias #by()', async () => {
      await new Activity()
        .on(post)
        .by(user)
        .log('new post')

      const activity = await Activity.findOne({ order: [ ['created_at', 'DESC'] ] })
      const activities = await Activity.findAll({ order: [ ['created_at', 'DESC'] ] })
      const subject = await activity.getSubject()
      const causer = await activity.getCauser()

      expect(activity).to.eql(activities[0])
      expect(activity.description).to.equal('new post')
      expect(subject).to.have.property('title', 'new title')
      expect(causer).to.have.property('name', 'test user')
    })

    it('should ignore to set causer when causer is undefined', async () => {
      expect(new Activity().causedBy().causer).to.be.undefined
    })

    it('should throw error when causer is not a Sequelize.Model instance', async () => {
      expect(() => new Activity().causedBy(null)).to.throw()
    })
  })

  describe('#withProperties()', () => {
    it('should log a activity with properties', async () => {
      await new Activity()
        .performedOn(post)
        .causedBy(user)
        .withProperties({ key: 'value' })
        .log('new post')

      const activity = await Activity.findOne({ order: [ ['created_at', 'DESC'] ] })
      const activities = await Activity.findAll({ order: [ ['created_at', 'DESC'] ] })
      const subject = await activity.getSubject()
      const causer = await activity.getCauser()

      expect(activity).to.eql(activities[0])
      expect(activity.description).to.equal('new post')
      expect(subject).to.have.property('title', 'new title')
      expect(causer).to.have.property('name', 'test user')
      expect(activity.properties).to.eql({ key: 'value' })
      expect(activity.getExtraProperty('key')).to.equal('value')
    })

    it('should have alias #with()', async () => {
      await new Activity()
        .on(post)
        .by(user)
        .with({ key: 'value' })
        .log('new post')

      const activity = await Activity.findOne({ order: [ ['created_at', 'DESC'] ] })
      const activities = await Activity.findAll({ order: [ ['created_at', 'DESC'] ] })
      const subject = await activity.getSubject()
      const causer = await activity.getCauser()

      expect(activity).to.eql(activities[0])
      expect(activity.description).to.equal('new post')
      expect(subject).to.have.property('title', 'new title')
      expect(causer).to.have.property('name', 'test user')
      expect(activity.properties).to.eql({ key: 'value' })
      expect(activity.getExtraProperty('key')).to.equal('value')
    })
  })

  describe('#withProperty()', () => {
    it('should log a activity with property', async () => {
      await new Activity()
        .performedOn(post)
        .causedBy(user)
        .withProperty('key', 'value')
        .log('new post')

      const activity = await Activity.findOne({ order: [ ['created_at', 'DESC'] ] })
      const activities = await Activity.findAll({ order: [ ['created_at', 'DESC'] ] })
      const subject = await activity.getSubject()
      const causer = await activity.getCauser()

      expect(activity).to.eql(activities[0])
      expect(activity.description).to.equal('new post')
      expect(subject).to.have.property('title', 'new title')
      expect(causer).to.have.property('name', 'test user')
      expect(activity.properties).to.eql({ key: 'value' })
      expect(activity.getExtraProperty('key')).to.equal('value')
    })

    it('should have alias #with()', async () => {
      await new Activity()
        .on(post)
        .by(user)
        .with('key', 'value')
        .log('new post')

      const activity = await Activity.findOne({ order: [ ['created_at', 'DESC'] ] })
      const activities = await Activity.findAll({ order: [ ['created_at', 'DESC'] ] })
      const subject = await activity.getSubject()
      const causer = await activity.getCauser()

      expect(activity).to.eql(activities[0])
      expect(activity.description).to.equal('new post')
      expect(subject).to.have.property('title', 'new title')
      expect(causer).to.have.property('name', 'test user')
      expect(activity.properties).to.eql({ key: 'value' })
      expect(activity.getExtraProperty('key')).to.equal('value')
    })
  })
})
