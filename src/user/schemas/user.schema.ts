import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
    @Prop({ type: Number})
    id: number;
  
    @Prop({ type: String, required: true, unique: true })
    email: string;
  
    @Prop({ type: String, required: true })
    name: string;
    
    @Prop({ type: String, required: true })
    job: string;

}

export const UserSchema = SchemaFactory.createForClass(User);
