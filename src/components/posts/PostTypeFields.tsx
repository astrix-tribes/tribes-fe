import React from 'react';
import EventFields from './EventFields';
import ImageFields from './ImageFields';
import PollFields from './PollFields';
import ResourceFields from './ResourceFields';
import MediaFields from './MediaFields';

interface PostTypeFieldsProps {
  type: string; // or PostType
}

const PostTypeFields: React.FC<PostTypeFieldsProps> = ({ type }) => {
  switch (type) {
    case 'event':
      return <EventFields />;
    case 'image':
      return <ImageFields />;
    case 'poll':
      return <PollFields />;
    case 'resource':
      return <ResourceFields />;
    case 'rich_media':
      return <MediaFields />;
    default:
      return null;
  }
};

export default PostTypeFields; 