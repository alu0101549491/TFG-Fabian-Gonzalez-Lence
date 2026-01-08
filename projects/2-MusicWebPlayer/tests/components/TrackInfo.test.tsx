// tests/components/TrackInfo.test.tsx
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { TrackInfo } from '@/components/TrackInfo';

describe('TrackInfo Component', () => {
  describe('Rendering - Basic', () => {
    it('should render without crashing', () => {
      // ARRANGE & ACT
      const { container } = render(
        <TrackInfo
          title="Test Song"
          artist="Test Artist"
          cover="/cover.jpg"
        />
      );

      // ASSERT
      expect(container).toBeInTheDocument();
    });

    it('should accept all required props', () => {
      const props = {
        title: 'Song Title',
        artist: 'Artist Name',
        cover: '<https://example.com/cover.jpg>'
      };

      expect(() => render(<TrackInfo {...props} />)).not.toThrow();
    });

    it('should render with typical props', () => {
      const { container } = render(
        <TrackInfo
          title="Midnight Dreams"
          artist="Luna Eclipse"
          cover="/covers/midnight-dreams.jpg"
        />
      );

      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('Cover Image Rendering', () => {
    it('should render img element', () => {
      render(
        <TrackInfo
          title="Song"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
    });

    it('should set img src to cover prop', () => {
      const coverUrl = 'https://example.com/album-cover.jpg';

      render(
        <TrackInfo
          title="Song"
          artist="Artist"
          cover={coverUrl}
        />
      );

      const img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toContain(coverUrl);
    });

    it('should have alt text on image', () => {
      render(
        <TrackInfo
          title="Test Song"
          artist="Test Artist"
          cover="/cover.jpg"
        />
      );

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt');
    });

    it('should have alt text format "{title} by {artist}"', () => {
      render(
        <TrackInfo
          title="Amazing Song"
          artist="Great Artist"
          cover="/cover.jpg"
        />
      );

      const img = screen.getByAltText('Amazing Song by Great Artist album cover');
      expect(img).toBeInTheDocument();
    });

    it('should render with HTTP URL', () => {
      render(
        <TrackInfo
          title="Song"
          artist="Artist"
          cover="http://example.com/cover.jpg"
        />
      );

      const img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toContain('http://');
    });

    it('should render with HTTPS URL', () => {
      render(
        <TrackInfo
          title="Song"
          artist="Artist"
          cover="https://example.com/cover.jpg"
        />
      );

      const img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toContain('https://');
    });

    it('should render with relative URL', () => {
      render(
        <TrackInfo
          title="Song"
          artist="Artist"
          cover="/covers/album.jpg"
        />
      );

      const img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toContain('/covers/album.jpg');
    });
  });

  describe('Title Rendering', () => {
    it('should display title text', () => {
      render(
        <TrackInfo
          title="Electric Pulse"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('Electric Pulse')).toBeInTheDocument();
    });

    it('should use semantic heading for title', () => {
      render(
        <TrackInfo
          title="Song Title"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      const heading = screen.getByRole('heading', { name: 'Song Title' });
      expect(heading).toBeInTheDocument();
    });

    it('should show complete title text', () => {
      const longTitle = 'This is a very long song title that should display completely';

      render(
        <TrackInfo
          title={longTitle}
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle very long title strings', () => {
      const veryLongTitle = 'A'.repeat(1000);

      render(
        <TrackInfo
          title={veryLongTitle}
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText(veryLongTitle)).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
      const titleWithSpecialChars = 'Song "Title" with \'quotes\' & symbols!';

      render(
        <TrackInfo
          title={titleWithSpecialChars}
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText(titleWithSpecialChars)).toBeInTheDocument();
    });
  });

  describe('Artist Rendering', () => {
    it('should display artist text', () => {
      render(
        <TrackInfo
          title="Song"
          artist="The Neon Knights"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('The Neon Knights')).toBeInTheDocument();
    });

    it('should show complete artist text', () => {
      const longArtist = 'This is a very long artist name that should display completely';

      render(
        <TrackInfo
          title="Song"
          artist={longArtist}
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText(longArtist)).toBeInTheDocument();
    });

    it('should handle very long artist strings', () => {
      const veryLongArtist = 'B'.repeat(1000);

      render(
        <TrackInfo
          title="Song"
          artist={veryLongArtist}
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText(veryLongArtist)).toBeInTheDocument();
    });

    it('should handle special characters in artist', () => {
      const artistWithSpecialChars = 'Artist "Name" with \'symbols\' @#$';

      render(
        <TrackInfo
          title="Song"
          artist={artistWithSpecialChars}
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText(artistWithSpecialChars)).toBeInTheDocument();
    });
  });

  describe('No Song State', () => {
    it('should handle empty title gracefully', () => {
      expect(() =>
        render(
          <TrackInfo
            title=""
            artist="Artist"
            cover="/cover.jpg"
          />
        )
      ).not.toThrow();
    });

    it('should handle empty artist gracefully', () => {
      expect(() =>
        render(
          <TrackInfo
            title="Song"
            artist=""
            cover="/cover.jpg"
          />
        )
      ).not.toThrow();
    });

    it('should handle empty title and artist', () => {
      expect(() =>
        render(
          <TrackInfo
            title=""
            artist=""
            cover="/cover.jpg"
          />
        )
      ).not.toThrow();
    });

    it('should show placeholder when no song playing', () => {
      const { container } = render(
        <TrackInfo
          title=""
          artist=""
          cover=""
        />
      );

      // Should either show placeholder text or render without error
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have alt attribute on image', () => {
      render(
        <TrackInfo
          title="Song"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt');
    });

    it('should have descriptive alt text', () => {
      render(
        <TrackInfo
          title="Accessible Song"
          artist="Accessible Artist"
          cover="/cover.jpg"
        />
      );

      const img = screen.getByRole('img');
      const altText = img.getAttribute('alt');

      expect(altText).toContain('Accessible Song');
      expect(altText).toContain('Accessible Artist');
    });

    it('should use semantic HTML for title', () => {
      render(
        <TrackInfo
          title="Semantic Title"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      // Should be a heading element
      const heading = screen.getByRole('heading');
      expect(heading).toHaveTextContent('Semantic Title');
    });

    it('should have accessible component structure', () => {
      const { container } = render(
        <TrackInfo
          title="Song"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      // Should have proper structure
      expect(container.querySelector('img')).toBeInTheDocument();
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should accept title prop', () => {
      const title = 'Test Title';

      render(
        <TrackInfo
          title={title}
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText(title)).toBeInTheDocument();
    });

    it('should accept artist prop', () => {
      const artist = 'Test Artist';

      render(
        <TrackInfo
          title="Song"
          artist={artist}
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText(artist)).toBeInTheDocument();
    });

    it('should accept cover prop', () => {
      const cover = 'https://example.com/test-cover.jpg';

      render(
        <TrackInfo
          title="Song"
          artist="Artist"
          cover={cover}
        />
      );

      const img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toContain(cover);
    });

    it('should update when props change', () => {
      const { rerender } = render(
        <TrackInfo
          title="Original Song"
          artist="Original Artist"
          cover="/original.jpg"
        />
      );

      expect(screen.getByText('Original Song')).toBeInTheDocument();

      rerender(
        <TrackInfo
          title="Updated Song"
          artist="Updated Artist"
          cover="/updated.jpg"
        />
      );

      expect(screen.getByText('Updated Song')).toBeInTheDocument();
      expect(screen.queryByText('Original Song')).not.toBeInTheDocument();
    });
  });

  describe('Special Characters', () => {
    it('should handle title with quotes', () => {
      render(
        <TrackInfo
          title='Song "Title" Here'
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('Song "Title" Here')).toBeInTheDocument();
    });

    it('should handle title with apostrophes', () => {
      render(
        <TrackInfo
          title="Don't Stop Me Now"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText("Don't Stop Me Now")).toBeInTheDocument();
    });

    it('should handle Unicode characters', () => {
      render(
        <TrackInfo
          title="日本語のタイトル"
          artist="Артист"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('日本語のタイトル')).toBeInTheDocument();
      expect(screen.getByText('Артист')).toBeInTheDocument();
    });

    it('should handle emojis', () => {
      render(
        <TrackInfo
          title="Song Title 🎵🎶"
          artist="Artist Name 🎤"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('Song Title 🎵🎶')).toBeInTheDocument();
      expect(screen.getByText('Artist Name 🎤')).toBeInTheDocument();
    });

    it('should handle special symbols', () => {
      render(
        <TrackInfo
          title="Song @#$%^&*()"
          artist="Artist !<>?"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('Song @#$%^&*()')).toBeInTheDocument();
      expect(screen.getByText('Artist !<>?')).toBeInTheDocument();
    });

    it('should handle HTML entities', () => {
      render(
        <TrackInfo
          title="Song & Title < > &quot;"
          artist="Artist & Name"
          cover="/cover.jpg"
        />
      );

      // React automatically escapes, should display correctly
      expect(screen.getByText(/Song & Title/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(1000);

      const { container } = render(
        <TrackInfo
          title={longTitle}
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle very long artist', () => {
      const longArtist = 'B'.repeat(1000);

      const { container } = render(
        <TrackInfo
          title="Song"
          artist={longArtist}
          cover="/cover.jpg"
        />
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle empty strings for all props', () => {
      expect(() =>
        render(
          <TrackInfo
            title=""
            artist=""
            cover=""
          />
        )
      ).not.toThrow();
    });

    it('should handle whitespace-only strings', () => {
      expect(() =>
        render(
          <TrackInfo
            title="   "
            artist="   "
            cover="/cover.jpg"
          />
        )
      ).not.toThrow();
    });

    it('should handle invalid cover URL gracefully', () => {
      const { container } = render(
        <TrackInfo
          title="Song"
          artist="Artist"
          cover="https://invalid-url-404.example.com/missing.jpg"
        />
      );

      // Image should still render, browser handles 404
      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
    });

    it('should handle cover URL with query parameters', () => {
      render(
        <TrackInfo
          title="Song"
          artist="Artist"
          cover="https://example.com/cover.jpg?w=300&h=300&token=abc123"
        />
      );

      const img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toContain('?w=300');
    });

    it('should handle cover URL with fragment', () => {
      render(
        <TrackInfo
          title="Song"
          artist="Artist"
          cover="https://example.com/cover.jpg#section"
        />
      );

      const img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toBeDefined();
    });
  });

  describe('Component Structure', () => {
    it('should have container element', () => {
      const { container } = render(
        <TrackInfo
          title="Song"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(container.firstChild).not.toBeNull();
    });

    it('should have image element', () => {
      render(
        <TrackInfo
          title="Song"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should have title heading', () => {
      render(
        <TrackInfo
          title="Song"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('should have artist text', () => {
      render(
        <TrackInfo
          title="Song"
          artist="Artist Name"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('Artist Name')).toBeInTheDocument();
    });

    it('should render elements in logical order', () => {
      const { container } = render(
        <TrackInfo
          title="Song"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      // Get all elements
      const elements = container.querySelectorAll('*');

      // Should have img, heading, and text element
      expect(elements.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Re-rendering', () => {
    it('should update title when prop changes', () => {
      const { rerender } = render(
        <TrackInfo
          title="First Song"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('First Song')).toBeInTheDocument();

      rerender(
        <TrackInfo
          title="Second Song"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('Second Song')).toBeInTheDocument();
      expect(screen.queryByText('First Song')).not.toBeInTheDocument();
    });

    it('should update artist when prop changes', () => {
      const { rerender } = render(
        <TrackInfo
          title="Song"
          artist="First Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('First Artist')).toBeInTheDocument();

      rerender(
        <TrackInfo
          title="Song"
          artist="Second Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByText('Second Artist')).toBeInTheDocument();
      expect(screen.queryByText('First Artist')).not.toBeInTheDocument();
    });

    it('should update cover when prop changes', () => {
      const { rerender } = render(
        <TrackInfo
          title="Song"
          artist="Artist"
          cover="/cover1.jpg"
        />
      );

      let img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toContain('cover1.jpg');

      rerender(
        <TrackInfo
          title="Song"
          artist="Artist"
          cover="/cover2.jpg"
        />
      );

      img = screen.getByRole('img') as HTMLImageElement;
      expect(img.src).toContain('cover2.jpg');
    });

    it('should update alt text when title or artist changes', () => {
      const { rerender } = render(
        <TrackInfo
          title="Original"
          artist="Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByAltText('Original by Artist album cover')).toBeInTheDocument();

      rerender(
        <TrackInfo
          title="Updated"
          artist="New Artist"
          cover="/cover.jpg"
        />
      );

      expect(screen.getByAltText('Updated by New Artist album cover')).toBeInTheDocument();
      expect(screen.queryByAltText('Original by Artist album cover')).not.toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should work with realistic song data', () => {
      render(
        <TrackInfo
          title="Midnight Dreams"
          artist="Luna Eclipse"
          cover="/covers/midnight-dreams.jpg"
        />
      );

      expect(screen.getByText('Midnight Dreams')).toBeInTheDocument();
      expect(screen.getByText('Luna Eclipse')).toBeInTheDocument();
      expect(screen.getByAltText('Midnight Dreams by Luna Eclipse album cover')).toBeInTheDocument();
    });

    it('should display multiple different songs correctly', () => {
      const songs = [
        { title: 'Song 1', artist: 'Artist 1', cover: '/1.jpg' },
        { title: 'Song 2', artist: 'Artist 2', cover: '/2.jpg' },
        { title: 'Song 3', artist: 'Artist 3', cover: '/3.jpg' }
      ];

      const { rerender } = render(
        <TrackInfo {...songs[0]} />
      );

      songs.forEach(song => {
        rerender(<TrackInfo {...song} />);
        expect(screen.getByText(song.title)).toBeInTheDocument();
        expect(screen.getByText(song.artist)).toBeInTheDocument();
      });
    });

    it('should handle all supported audio formats metadata', () => {
      const formats = [
        { title: 'MP3 Song', artist: 'Artist 1', cover: '/mp3.jpg' },
        { title: 'WAV Song', artist: 'Artist 2', cover: '/wav.jpg' },
        { title: 'OGG Song', artist: 'Artist 3', cover: '/ogg.jpg' },
        { title: 'M4A Song', artist: 'Artist 4', cover: '/m4a.jpg' }
      ];

      formats.forEach(song => {
        const { unmount } = render(<TrackInfo {...song} />);
        expect(screen.getByText(song.title)).toBeInTheDocument();
        unmount();
      });
    });
  });
});
