# Skill: Next.js Patterns

Domain knowledge for writing frontend code consistent with the nexpy Next.js 14 codebase.

---

## Overview

The frontend is a Next.js 14 (Pages Router) application using:
- **MUI (Material UI) v5** for all UI components and theming
- **React Query v3** for server state management and data fetching
- **axios** (via `apiClient` in `src/api/headers.js`) for HTTP requests
- **js-cookie** for token storage
- **react-hot-toast** for notifications/toasts
- **Custom hooks** in `src/hooks/` for auth and UI state
- **Sections** pattern — pages are thin shells; content lives in `src/sections/`

---

## Pattern 1: Page Structure

Pages are thin wrappers. Keep them under ~60 lines. All UI lives in section components:

```javascript
// nextjs/src/pages/notifications.js
import { Box, Container, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { apiClient } from "@/api/headers";
import { endpoints } from "@/api/endpoints";
import useAuthenticatedRoute from "@/hooks/use-authenticated-route";
import Loading from "@/components/loading";
import Error from "@/components/error";
import NotificationsSection from "@/sections/notifications/notifications-section";

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuthenticatedRoute();

  const { data, isLoading, isError } = useQuery(
    ["notifications"],
    async () => {
      const res = await apiClient.get(endpoints.notifications.index);
      return res.data;
    },
    { enabled: !!user }
  );

  if (authLoading || isLoading) return <Loading />;
  if (isError) return <Error message="Failed to load notifications." />;

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Notifications</Typography>
        <NotificationsSection data={data} />
      </Box>
    </Container>
  );
}
```

**Key rules:**
- Always call `useAuthenticatedRoute()` at the top — it redirects to `/login` if unauthenticated.
- Pass `enabled: !!user` to React Query so queries only fire after auth is confirmed.
- Render `<Loading />` and `<Error />` from `src/components/` — never use custom spinners inline.

---

## Pattern 2: API Client and Endpoints

All HTTP calls go through `apiClient` (axios instance with the auth token attached):

```javascript
// src/api/headers.js — already configured; use as-is
import { apiClient } from "@/api/headers";

// GET
const res = await apiClient.get(endpoints.notifications.index);

// POST
const res = await apiClient.post(endpoints.notifications.index, { message: "Hello" });

// PUT
const res = await apiClient.put(endpoints.notifications.detail(id), { is_read: true });

// DELETE
await apiClient.delete(endpoints.notifications.detail(id));
```

Register endpoints in `src/api/endpoints.js`:

```javascript
// src/api/endpoints.js
export const endpoints = {
  auth: {
    login: "/api/v1/auth/token",
    logout: "/api/v1/auth/logout",
  },
  users: {
    index: "/api/v1/users",
    detail: (id) => `/api/v1/users/${id}`,
  },
  notifications: {                            // new endpoint
    index: "/api/v1/notifications",
    detail: (id) => `/api/v1/notifications/${id}`,
  },
};
```

---

## Pattern 3: Mutations with React Query

Use `useMutation` for POST/PUT/DELETE operations and invalidate queries on success:

```javascript
import { useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { apiClient } from "@/api/headers";
import { endpoints } from "@/api/endpoints";

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation(
    async (id) => {
      const res = await apiClient.put(endpoints.notifications.detail(id), { is_read: true });
      return res.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["notifications"]);
        toast.success("Notification marked as read.");
      },
      onError: () => {
        toast.error("Could not update notification.");
      },
    }
  );
}
```

---

## Pattern 4: MUI Styling

Use the `sx` prop for one-off styles. Use `styled()` only for reusable overrides:

```javascript
// One-off styles — use sx prop
<Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}>

// Spacing uses the MUI theme scale (1 unit = 8px by default)
<Box sx={{ mt: 2, mb: 4 }}>   // margin-top: 16px, margin-bottom: 32px

// Responsive values
<Box sx={{ flexDirection: { xs: "column", md: "row" } }}>

// Access theme values
<Box sx={{ bgcolor: "background.paper", color: "text.primary" }}>
```

Do **not** use inline `style={{}}` for layout/spacing — always use `sx`.

---

## Pattern 5: Section Components

Section components receive data as props and own the rendering logic:

```javascript
// nextjs/src/sections/notifications/notifications-section.js
import PropTypes from "prop-types";
import { Box, Typography, Chip } from "@mui/material";

export default function NotificationsSection({ data }) {
  if (!data || data.length === 0) {
    return <Typography color="text.secondary">No notifications yet.</Typography>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {data.map((item, index) => (
        <Box
          key={item.id ?? index}
          sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}
        >
          <Typography>{item.message}</Typography>
          <Chip label={item.is_read ? "Read" : "Unread"} size="small" sx={{ mt: 1 }} />
        </Box>
      ))}
    </Box>
  );
}

NotificationsSection.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      message: PropTypes.string.isRequired,
      is_read: PropTypes.bool,
    })
  ),
};
```

---

## Pattern 6: Authentication Hook

```javascript
import useAuthenticatedRoute from "@/hooks/use-authenticated-route";

export default function ProtectedPage() {
  const { user, loading } = useAuthenticatedRoute();
  // Hook handles redirect to /login if user is null.
  // Render nothing (or <Loading />) while auth state loads.
  if (loading) return <Loading />;
  return <div>Welcome, {user.username}</div>;
}
```

---

## Anti-Patterns

| Anti-Pattern | Correct Alternative |
|---|---|
| Direct `axios.get()` calls | Use `apiClient` from `src/api/headers.js` |
| Hardcoded URL strings | Use `endpoints` from `src/api/endpoints.js` |
| Inline `style={{ marginTop: 16 }}` | Use `sx={{ mt: 2 }}` |
| Business logic inside pages | Move to section components or custom hooks |
| `fetch()` instead of axios | Use `apiClient` consistently |
| `localStorage` for auth token | Tokens managed by `js-cookie` via the auth context |
| Querying without `enabled: !!user` | Always gate queries on auth state |
