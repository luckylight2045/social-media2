import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { ObjectId } from 'mongoose';
import { Post } from 'src/posts/schema/post.schema';

@Schema({ _id: false })
class FullName {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;
}

export enum Gender {
  man = 'man',
  woman = 'woman',
  other = 'other',
}

@Schema({ _id: false })
export class Userlist {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: ObjectId;
}

@Schema()
class Profile {
  @Prop()
  followers: Userlist[];

  @Prop()
  followings: Userlist[];

  @Prop()
  posts: Post[];
}

@Schema()
export class User {
  @Prop({ required: false })
  fullName: FullName;

  @Prop({ reqiured: false })
  profilePic: string;

  @Prop({ required: true, unique: true })
  userName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false, unique: true, sparse: true, trim: true })
  email: string;

  @Prop({ required: false, enum: Gender })
  gender: Gender;

  @Prop({ required: false })
  birthDate: Date;

  @Prop({
    required: true,
    unique: true,
  })
  phoneNumber: string;

  @Prop()
  profile: Profile;
}

export const userSchema = SchemaFactory.createForClass(User);
