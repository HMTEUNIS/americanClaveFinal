// lib/album-images.ts
export interface AlbumImageConfig {
    [slug: string]: {
      images: string[];
      imageData?: {
        [imageName: string]: {
          type: string;
          caption: string;
        };
      };
    };
  }
  
  export const albumImageConfig: AlbumImageConfig = {
    foxybrownisnice: {
      images: ['cover.jpg', 'page1.jpg', 'page2.jpg', 'booklet.jpg'],
      imageData: {
        'cover.jpg': { type: 'cover', caption: 'Album Cover' },
        'page1.jpg': { type: 'liner', caption: 'Liner Notes' }
      }
    },
    anotherabum: {
      images: ['cover.jpg', 'page1.jpg']
    }
    // ... all your albums
  };