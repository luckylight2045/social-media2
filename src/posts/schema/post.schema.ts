import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Userlist } from 'src/user/schema/user.schema';

@Schema()
export class Post {
  @Prop()
  postpic: string;

  @Prop()
  caption: string;

  @Prop()
  likes: Userlist[];

  @Prop()
  comments: Userlist[];
}

export const postSchema = SchemaFactory.createForClass(Post);
