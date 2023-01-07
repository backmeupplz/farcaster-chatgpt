import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'

@modelOptions({
  schemaOptions: { timestamps: true },
})
export class SeenCast {
  @prop({ index: true, required: true })
  hash!: string
}

export const SeenCastModel = getModelForClass(SeenCast)
