#!/usr/bin/env python3
"""
IPTV Playlist Parser
A utility for parsing and managing M3U IPTV playlists
"""

import os
import json
import sys
import argparse
from typing import List, Dict, Optional
import re


class Channel:
    """Represents a single channel in a playlist"""
    
    def __init__(self, name: str, url: str, duration: str = "-1", **kwargs):
        self.name = name
        self.url = url
        self.duration = duration
        self.attributes = kwargs
    
    def to_dict(self) -> Dict:
        return {
            'name': self.name,
            'url': self.url,
            'duration': self.duration,
            **self.attributes
        }
    
    def __repr__(self) -> str:
        return f"Channel(name='{self.name}', url='{self.url}')"


class PlaylistParser:
    """Parser for M3U IPTV playlists"""
    
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.channels: List[Channel] = []
        self.metadata = {}
    
    def parse(self) -> List[Channel]:
        """Parse M3U playlist file"""
        if not os.path.exists(self.file_path):
            print(f"Error: File {self.file_path} not found")
            return []
        
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            i = 0
            if lines and lines[0].strip().startswith('#EXTM3U'):
                self.metadata['type'] = 'EXTM3U'
                i = 1
            
            while i < len(lines):
                line = lines[i].strip()
                
                if line.startswith('#EXTINF:'):
                    # Parse EXTINF line
                    extinf_data = line.replace('#EXTINF:', '').strip()
                    parts = extinf_data.rsplit(',', 1)
                    
                    duration = parts[0] if parts else "-1"
                    name = parts[1] if len(parts) > 1 else "Unknown"
                    
                    # Get URL from next line
                    if i + 1 < len(lines):
                        url = lines[i + 1].strip()
                        if url and not url.startswith('#'):
                            channel = Channel(name, url, duration)
                            self.channels.append(channel)
                            i += 2
                        else:
                            i += 1
                    else:
                        i += 1
                else:
                    i += 1
            
            return self.channels
        
        except Exception as e:
            print(f"Error parsing playlist: {e}")
            return []
    
    def search(self, query: str) -> List[Channel]:
        """Search channels by name"""
        query_lower = query.lower()
        return [ch for ch in self.channels if query_lower in ch.name.lower()]
    
    def filter_by_category(self, category: str) -> List[Channel]:
        """Filter channels by category (if available in attributes)"""
        return [ch for ch in self.channels 
                if ch.attributes.get('category', '').lower() == category.lower()]
    
    def to_json(self, output_file: Optional[str] = None) -> str:
        """Export playlist to JSON"""
        data = {
            'metadata': self.metadata,
            'channels': [ch.to_dict() for ch in self.channels]
        }
        json_str = json.dumps(data, indent=2, ensure_ascii=False)
        
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(json_str)
            print(f"Exported to {output_file}")
        
        return json_str
    
    def to_m3u(self, output_file: str):
        """Export to M3U format"""
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('#EXTM3U\n')
            for channel in self.channels:
                f.write(f'#EXTINF:{channel.duration},{channel.name}\n')
                f.write(f'{channel.url}\n')
        print(f"Exported to {output_file}")
    
    def print_channels(self, channels: Optional[List[Channel]] = None):
        """Print channels in a formatted table"""
        if channels is None:
            channels = self.channels
        
        if not channels:
            print("No channels found")
            return
        
        print(f"\n{'#':<4} {'Channel Name':<40} {'URL':<50}")
        print("-" * 100)
        
        for idx, ch in enumerate(channels, 1):
            url_short = ch.url[:47] + "..." if len(ch.url) > 50 else ch.url
            print(f"{idx:<4} {ch.name:<40} {url_short:<50}")
        
        print(f"\nTotal: {len(channels)} channels")


def main():
    """Main CLI interface"""
    parser = argparse.ArgumentParser(
        description='IPTV Playlist Manager - Parse and manage M3U playlists'
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Command to execute')
    
    # Parse command
    parse_cmd = subparsers.add_parser('parse', help='Parse a playlist file')
    parse_cmd.add_argument('file', help='Path to M3U playlist file')
    
    # Search command
    search_cmd = subparsers.add_parser('search', help='Search for channels')
    search_cmd.add_argument('file', help='Path to M3U playlist file')
    search_cmd.add_argument('query', help='Search query')
    
    # List command
    list_cmd = subparsers.add_parser('list', help='List channels')
    list_cmd.add_argument('file', help='Path to M3U playlist file')
    list_cmd.add_argument('--category', help='Filter by category')
    
    # Export command
    export_cmd = subparsers.add_parser('export', help='Export playlist')
    export_cmd.add_argument('file', help='Path to M3U playlist file')
    export_cmd.add_argument('--format', choices=['json', 'm3u'], 
                           default='json', help='Export format')
    export_cmd.add_argument('--output', required=True, help='Output file path')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    if args.command == 'parse':
        pl = PlaylistParser(args.file)
        pl.parse()
        pl.print_channels()
    
    elif args.command == 'search':
        pl = PlaylistParser(args.file)
        pl.parse()
        results = pl.search(args.query)
        print(f"\nSearch results for '{args.query}':")
        pl.print_channels(results)
    
    elif args.command == 'list':
        pl = PlaylistParser(args.file)
        pl.parse()
        if args.category:
            channels = pl.filter_by_category(args.category)
            print(f"\nChannels in '{args.category}' category:")
        else:
            channels = pl.channels
        pl.print_channels(channels)
    
    elif args.command == 'export':
        pl = PlaylistParser(args.file)
        pl.parse()
        if args.format == 'json':
            pl.to_json(args.output)
        else:
            pl.to_m3u(args.output)


if __name__ == '__main__':
    main()