# Sanity Query Optimization Guide

## N+1 Query Prevention

### ❌ Bad: N+1 Query Pattern

```groq
*[_type == "post"] {
  _id,
  title,
  // This causes separate queries for each category reference
  categories[]
}
```

This will make 1 query for posts + N queries for categories (one per post).

### ✅ Good: Single Query with Projection

```groq
*[_type == "post"] {
  _id,
  title,
  // Use -> to expand references in a single query
  categories[]-> {
    _id,
    title,
    slug,
    color
  }
}
```

## Best Practices

### 1. Always Use Explicit Projections

```groq
// ✅ Good: Only fetch what you need
*[_type == "post"] {
  _id,
  title,
  slug,
  excerpt
}

// ❌ Bad: Fetches all fields (slower, more bandwidth)
*[_type == "post"]
```

### 2. Filter on the Server

```groq
// ✅ Good: Filter in GROQ
*[_type == "post" && featured == true] | order(publishedAt desc) [0...3]

// ❌ Bad: Fetch all and filter in JavaScript
// *[_type == "post"].filter(p => p.featured).slice(0, 3)
```

### 3. Use Pagination

```groq
// ✅ Good: Paginated query
*[_type == "post"] | order(publishedAt desc) [$start...$end] {
  ...fields
}

// ❌ Bad: Fetch all posts at once
*[_type == "post"] | order(publishedAt desc)
```

### 4. Optimize Count Queries

```groq
// ✅ Good: Count without fetching documents
count(*[_type == "post" && featured == true])

// ❌ Bad: Fetch all documents just to count
*[_type == "post" && featured == true][].length()
```

### 5. Avoid Deep Nesting

```groq
// ✅ Good: Limit nesting depth (2-3 levels max)
*[_type == "post"] {
  _id,
  title,
  categories[]-> {
    _id,
    title,
    slug
  }
}

// ❌ Bad: Too many nested expansions (slow)
*[_type == "post"] {
  _id,
  title,
  categories[]-> {
    _id,
    title,
    posts[]-> {
      _id,
      title,
      author-> {
        _id,
        name,
        posts[]-> {
          // Too deep!
        }
      }
    }
  }
}
```

## Current Implementation Status

All queries in `sanity/lib/queries.ts` follow these best practices:

- ✅ Explicit projections
- ✅ Reference expansion with `->`
- ✅ Server-side filtering and sorting
- ✅ Pagination where needed
- ✅ Efficient count queries
- ✅ Proper index usage (Sanity auto-indexes references)

## Performance Monitoring

To monitor query performance:

1. Enable Sanity Vision in Studio
2. Use EXPLAIN in GROQ queries
3. Check query execution time in browser DevTools
4. Monitor bundle size impact of data fetching

## Caching Strategy

```typescript
// Use Next.js revalidation for ISR
const posts = await client.fetch(postsQuery, {
  next: {
    revalidate: 60, // Revalidate every 60 seconds
    tags: ['posts'], // Cache tag for on-demand revalidation
  },
});
```
