# Command: scaffold-page

Scaffolds a new Next.js page under `nextjs/src/pages/` along with a matching section folder under `nextjs/src/sections/`.

---

## Parameters

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | string | yes | — | Page name in kebab-case (e.g. `notifications`) |
| `route` | string | no | `/<name>` | URL route for the page (e.g. `/notifications`) |
| `api_endpoint` | string | no | `/api/v1/<name>` | Backend endpoint to fetch data from |
| `auth_required` | boolean | no | `true` | Redirect to login if user is not authenticated |
| `table_view` | boolean | no | `false` | Scaffold a data table layout instead of a basic layout |

---

## Steps

### 1. Create the page file

Create `nextjs/src/pages/<name>.js` with the following template:

```javascript
import { Box, Container, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { apiClient } from "@/api/headers";
import { endpoints } from "@/api/endpoints";
import useAuthenticatedRoute from "@/hooks/use-authenticated-route";
import Loading from "@/components/loading";
import Error from "@/components/error";
import <PascalName>Section from "@/sections/<name>/<name>-section";  // created in step 2

export default function <PascalName>Page() {
  const { user, loading: authLoading } = useAuthenticatedRoute();

  const { data, isLoading, isError } = useQuery(
    ["<name>"],
    async () => {
      const response = await apiClient.get(endpoints.<name>.index);
      return response.data;
    },
    { enabled: !!user }
  );

  if (authLoading || isLoading) return <Loading />;
  if (isError) return <Error message="Failed to load <name>." />;

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          <PascalName>
        </Typography>
        <<PascalName>Section data={data} />
      </Box>
    </Container>
  );
}
```

### 2. Create the section folder and component

Create `nextjs/src/sections/<name>/<name>-section.js`:

```javascript
import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";

export default function <PascalName>Section({ data }) {
  if (!data || data.length === 0) {
    return <Typography>No <name> found.</Typography>;
  }

  return (
    <Box>
      {data.map((item, index) => (
        <Box key={index} sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
          <Typography>{JSON.stringify(item)}</Typography>
        </Box>
      ))}
    </Box>
  );
}

<PascalName>Section.propTypes = {
  data: PropTypes.array,
};
```

### 3. Register the endpoint

Add the new endpoint to `nextjs/src/api/endpoints.js`:

```javascript
<name>: {
  index: "/api/v1/<name>",
},
```

### 4. Add to navigation (optional)

If the page should appear in the navigation menu, add an entry to `nextjs/src/theme/menu-icons.js` and `nextjs/src/sections/header/menu-items.js`.

---

## Example

**Input:**
```yaml
name: notifications
route: /notifications
api_endpoint: /api/v1/notifications
auth_required: true
```

**Output files:**
- `nextjs/src/pages/notifications.js`
- `nextjs/src/sections/notifications/notifications-section.js`
- `nextjs/src/api/endpoints.js` — updated with `notifications.index`

---

## Naming Convention

| Input (`name`) | Page file | Section folder | Component name |
|---|---|---|---|
| `notifications` | `notifications.js` | `sections/notifications/` | `NotificationsSection` |
| `user-profile` | `user-profile.js` | `sections/user-profile/` | `UserProfileSection` |
