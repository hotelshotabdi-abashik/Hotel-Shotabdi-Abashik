# Database Configuration Instructions

## Overview
The database rules have been updated to fix issues with booking submissions and role management. Please follow the instructions below to apply these changes to your Firebase project.

## 1. Update Realtime Database Rules
Copy the following JSON content and paste it into your Firebase Console -> Realtime Database -> Rules tab.

```json
{
  "rules": {
    "site-config": {
      ".read": true,
      ".write": "auth != null && (root.child('roles').child(auth.uid).val() === 'owner' || root.child('roles').child(auth.uid).val() === 'manager' || auth.token.email === 'hotelshotabdiabashik@gmail.com')"
    },
    "bookings": {
      ".indexOn": ["userId", "status"],
      ".read": "auth != null && (root.child('roles').child(auth.uid).val() === 'owner' || root.child('roles').child(auth.uid).val() === 'manager' || auth.token.email === 'hotelshotabdiabashik@gmail.com')",
      "$bookingId": {
        ".read": "auth != null && (data.child('userId').val() === auth.uid || root.child('roles').child(auth.uid).val() === 'owner' || root.child('roles').child(auth.uid).val() === 'manager')",
        ".write": "auth != null && ((newData.exists() && newData.child('userId').val() === auth.uid) || (data.exists() && data.child('userId').val() === auth.uid) || root.child('roles').child(auth.uid).val() === 'owner' || root.child('roles').child(auth.uid).val() === 'manager')"
      }
    },
    "roles": {
      ".read": "auth != null",
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && (root.child('roles').child(auth.uid).val() === 'owner' || auth.token.email === 'hotelshotabdiabashik@gmail.com')"
      }
    },
    "profiles": {
      ".read": "auth != null && (root.child('roles').child(auth.uid).val() === 'owner' || root.child('roles').child(auth.uid).val() === 'manager' || auth.token.email === 'hotelshotabdiabashik@gmail.com')",
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || root.child('roles').child(auth.uid).val() === 'owner' || root.child('roles').child(auth.uid).val() === 'manager')",
        ".write": "auth != null && (auth.uid === $uid || root.child('roles').child(auth.uid).val() === 'owner' || root.child('roles').child(auth.uid).val() === 'manager')"
      }
    },
    "help_dex": {
      "active_chats": {
        ".read": "auth != null && (root.child('roles').child(auth.uid).val() === 'owner' || root.child('roles').child(auth.uid).val() === 'manager')",
        ".write": "auth != null && (root.child('roles').child(auth.uid).val() === 'owner' || root.child('roles').child(auth.uid).val() === 'manager')",
        "$uid": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && (auth.uid === $uid || root.child('roles').child(auth.uid).val() === 'owner' || root.child('roles').child(auth.uid).val() === 'manager')"
        }
      },
      "messages": {
        ".read": "auth != null && (root.child('roles').child(auth.uid).val() === 'owner' || root.child('roles').child(auth.uid).val() === 'manager')",
        "$uid": {
          ".read": "auth != null && (auth.uid === $uid || root.child('roles').child(auth.uid).val() === 'owner' || root.child('roles').child(auth.uid).val() === 'manager')",
          ".write": "auth != null && (auth.uid === $uid || root.child('roles').child(auth.uid).val() === 'owner' || root.child('roles').child(auth.uid).val() === 'manager')"
        }
      }
    },
    "notifications": {
      ".read": "auth != null && (root.child('roles').child(auth.uid).val() === 'owner' || root.child('roles').child(auth.uid).val() === 'manager' || auth.token.email === 'hotelshotabdiabashik@gmail.com')",
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || root.child('roles').child(auth.uid).val() === 'owner' || root.child('roles').child(auth.uid).val() === 'manager')",
        ".write": "auth != null && (auth.uid === $uid || root.child('roles').child(auth.uid).val() === 'owner' || root.child('roles').child(auth.uid).val() === 'manager')"
      }
    },
    "logs": {
      ".read": "auth != null && (root.child('roles').child(auth.uid).val() === 'owner' || root.child('roles').child(auth.uid).val() === 'manager' || auth.token.email === 'hotelshotabdiabashik@gmail.com')",
      ".write": "auth != null && (root.child('roles').child(auth.uid).val() === 'owner' || root.child('roles').child(auth.uid).val() === 'manager' || auth.token.email === 'hotelshotabdiabashik@gmail.com')"
    },
    "usernames": {
      ".read": true,
      "$username": {
        ".write": "auth != null && (!data.exists() || data.val() === auth.uid || root.child('roles').child(auth.uid).val() === 'owner' || root.child('roles').child(auth.uid).val() === 'manager')"
      }
    }
  }
}
```

## 2. Manager Role Application
To apply the Manager role correctly:
1. Ensure you are logged in as the Owner (`hotelshotabdiabashik@gmail.com`).
2. Go to the Admin Dashboard.
3. In the "Users" tab, find the user you want to promote.
4. Click the "Manager" button.
5. Enter the security code: `kahar02`.

If you are already a Manager but cannot access the Admin Dashboard, ensure your role is correctly set in the database under the `roles` node. The structure should be:
```
roles: {
  "USER_UID": "manager"
}
```

## 3. Booking Submission
The booking submission issue was caused by restrictive write rules on the `bookings` node. The updated rules above allow authenticated users to create new bookings where the `userId` matches their own ID.
