import { SERVER_URL_API } from '@/const';
import { CKEditor } from 'ckeditor4-react';

const CKeditor = ({ content, onChange, className, readOnly, style }: any) => {
  if (readOnly)
    return (
      <div
        className="-mt-[1px] ck_form_disabled cursor-text pointer-events-none"
        key={content}
      >
        <CKEditor
          initData={content}
          disabled
          type={'inline'}
          onContentDom={(event: any) => {
            event.editor.document.on('click', (e: any) => {
              const element = e.data.getTarget();

              // Cari parent yang merupakan elemen <a>
              const anchorElement = element.getAscendant('a', true);

              if (anchorElement) {
                const href =
                  anchorElement.getAttribute('data-cke-saved-href') ||
                  anchorElement.getAttribute('href');
                console.log(href); // Debug log

                if (href) {
                  console.log('Opening new tab with URL:', href); // Debug log
                  window.open(href, '_blank');
                }
              }
            });
          }}
          config={{
            readOnly: true,
            title: false,
            extraPlugins: ['mathjax'],
            mathJaxLib:
              'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js?config=TeX-AMS_HTML',
          }}
        />
      </div>
    );
  return (
    <div className={`ckeditor ${className} bg-white`} style={style}>
      <CKEditor
        initData={content}
        onChange={(event: any) => {
          onChange(event.editor.getData());
        }}
        type={'inline'}
        config={{
          filebrowserImageUploadUrl: `${SERVER_URL_API}/file/upload`,
          imageUploadUrl: `${SERVER_URL_API}/file/upload`,
          extraPlugins: ['mathjax'],
          mathJaxLib:
            'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js?config=TeX-AMS_HTML',
        }}
      />
    </div>
  );
};

export default CKeditor;
