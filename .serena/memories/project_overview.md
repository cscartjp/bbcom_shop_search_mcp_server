# BBcom Shop Search MCP Server - Project Overview

## Purpose
This is a Model Context Protocol (MCP) compliant server for searching shops, restaurants, and job listings in Miyakojima, Okinawa. It provides a natural language interface for AI assistants to query a PostgreSQL database with geospatial capabilities.

## Tech Stack
- **Language**: TypeScript (ES2022)
- **Runtime**: Node.js 18+
- **Framework**: MCP SDK (@modelcontextprotocol/sdk)
- **Database**: PostgreSQL with PostGIS extension
- **ORM**: Prisma 5.22
- **Validation**: Zod
- **Build Tool**: esbuild
- **Dev Tools**: tsx for TypeScript execution

## Main Features
1. Five search tools for MCP clients:
   - searchByCategory: Category-based search with location sorting
   - searchByLocation: Radius-based geospatial search
   - searchByTags: Tag filtering with AND/OR logic
   - searchByText: Full-text search across multiple fields
   - getItemById: Detailed item retrieval

2. Geospatial capabilities using PostGIS for efficient location-based queries
3. Built-in landmark database for Miyakojima locations
4. Opening hours checking functionality
5. Distance calculation and sorting

## Architecture
- MCP server using StdioServerTransport for IPC
- Modular tool implementation in src/mcp/tools/
- Zod schemas for parameter validation
- Utility functions for geocoding and landmarks
- Database models: CitadelaItem (main entity) and Landmark (location references)