import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'

@modelOptions({
  schemaOptions: { timestamps: true },
})
export class Conversation {
  @prop({ index: true, required: true })
  threadHash!: string
  @prop({ index: true, required: true })
  currentParentMessageId!: string
}

export const ConversationModel = getModelForClass(Conversation)
