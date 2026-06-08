import { Image } from 'tdesign-react';
import { imageLink } from './image-link';
import { IconEye } from '@tabler/icons-react';

const createTrigger =
  (gambar: any) =>
  ({ open }: any) => {
    const mask = (
      <div
        style={{
          background: 'rgba(0,0,0,.6)',
          color: '#fff',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={open}
      >
        <span>
          <IconEye />
        </span>
      </div>
    );

    return (
      <Image
        alt={'test'}
        src={imageLink(gambar)}
        overlayContent={mask}
        overlayTrigger="hover"
        fit="contain"
        style={{
          width: 100,
          height: 100,
          border: '1px solid var(--td-bg-color-secondarycontainer)',
          borderRadius: 'var(--td-radius-medium)',
          backgroundColor: '#fff',
        }}
      />
    );
  };

export default createTrigger;
