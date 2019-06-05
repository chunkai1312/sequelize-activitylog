'use strict'

const Sequelize = require('sequelize')

const defaultLogName = 'default'

module.exports = function (sequelize, options) {
  options = options || /* istanbul ignore next */ { modelName: 'activity_log', defaultLogName: 'default' }

  const Activity = sequelize.define(options.modelName, {
    log_name: { type: Sequelize.STRING, defaultValue: defaultLogName },
    description: { type: Sequelize.STRING },
    subject_id: { type: Sequelize.INTEGER },
    subject_type: { type: Sequelize.STRING },
    causer_id: { type: Sequelize.INTEGER },
    causer_type: { type: Sequelize.STRING },
    properties: { type: Sequelize.JSON }
  }, {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })

  /**
   * Log an activity.
   *
   * @param {String} description - The description of logging activity.
   * @returns {Promise}
   */
  Activity.prototype.log = function (description) {
    this.description = description
    return this.save()
  }

  /**
   * Specify on which object the activity is performed.
   *
   * @param {Model} instance - The sequelize instance.
   * @returns {this}
   */
  Activity.prototype.performedOn = function (instance) {
    if (typeof instance === 'undefined') return this
    if (!(instance instanceof Sequelize.Model)) throw TypeError('Invalid performedOn() argument. Must be `Sequelize.Model`.')
    this.subject_id = instance.id
    this.subject_type = instance._modelOptions.name.singular
    return this
  }

  /**
   * Set who or what caused the activity.
   *
   * @param {Model} instance - The sequelize instance.
   * @returns {this}
   */
  Activity.prototype.causedBy = function (instance) {
    if (typeof instance === 'undefined') return this
    if (!(instance instanceof Sequelize.Model)) throw TypeError('Invalid causedBy() argument. Must be `Sequelize.Model`.')
    this.causer_id = instance.id
    this.causer_type = instance._modelOptions.name.singular
    return this
  }

  /**
   * Add properties to the activity.
   *
   * @param {Object} properties - The properties.
   * @returns {this}
   */
  Activity.prototype.withProperties = function (properties) {
    this.properties = properties
    return this
  }

  /**
   * Add a property to the activity by key.
   *
   * @param {Object} properties - The properties.
   * @returns {this}
   */
  Activity.prototype.withProperty = function (key, value) {
    this.properties = this.properties || {}
    this.properties[key] = value
    return this
  }

  /**
   * Get value of the property.
   *
   * @param {String} key - The key of the property.
   * @returns {any} - The value of the key.
   */
  Activity.prototype.getExtraProperty = function (key) {
    return this.properties[key]
  }

  /**
   * Get subject of the activity.
   *
   * @param {Object} - The `Model.findByPk` options.
   * @return {Model} - The subject model instance.
   */
  Activity.prototype.getSubject = async function (options) {
    if (!this.subject_type || !this.subject_id) return null

    const Model = this.sequelize.models[this.subject_type]
    const instance = await Model.findByPk(this.subject_id, options)

    return instance
  }

  /**
   * Get causer of the activity.
   *
   * @param {Object} - The `Model.findByPk` options.
   * @return {Model} - The causer model instance.
   */
  Activity.prototype.getCauser = async function (options) {
    if (!this.causer_type || !this.causer_id) return null

    const Model = this.sequelize.models[this.causer_type]
    const instance = await Model.findByPk(this.causer_id, options)

    return instance
  }

  /**
   * Specify log name of the activity.
   *
   * @param {String} logName - The log name of the activity.
   * @returns {this}
   */
  Activity.prototype.useLog = function (logName) {
    this.log_name = logName
    return this
  }

  /**
   * Alias of useLog()
   *
   * @alias Activity.prototype.useLog
   */
  Activity.prototype.use = Activity.prototype.useLog

  /**
   * Alias of performedOn()
   *
   * @alias Activity.prototype.performedOn
   */
  Activity.prototype.on = Activity.prototype.performedOn

  /**
   * Alias of causedBy()
   *
   * @alias Activity.prototype.causedBy
   */
  Activity.prototype.by = Activity.prototype.causedBy

  /**
   * Alias of withProperties() / withProperty()
   *
   * @alias Activity.prototype.withProperties
   * @alias Activity.prototype.withProperty
   */
  Activity.prototype.with = function () {
    if (arguments.length === 2) return Activity.prototype.withProperty.apply(this, arguments)
    return Activity.prototype.withProperties.apply(this, arguments)
  }

  return Activity
}
