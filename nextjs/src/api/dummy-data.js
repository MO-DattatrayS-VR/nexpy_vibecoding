// Dummy data for development/demo — no backend required

export const DUMMY_TOKEN = 'dummy-token-dev-12345';

export const DUMMY_CREDENTIALS = {
    username: 'admin',
    password: 'admin',
};

export const dummyProfile = {
    _id: '1',
    username: 'admin',
    email: 'admin@example.com',
    full_name: 'Admin User',
    disabled: false,
    role: 'admin',
};

export const dummyUsers = [
    {
        _id: '1',
        username: 'admin',
        email: 'admin@example.com',
        full_name: 'Admin User',
        disabled: false,
        role: 'admin',
    },
    {
        _id: '2',
        username: 'jdoe',
        email: 'jdoe@example.com',
        full_name: 'John Doe',
        disabled: false,
        role: 'user',
    },
    {
        _id: '3',
        username: 'jsmith',
        email: 'jsmith@example.com',
        full_name: 'Jane Smith',
        disabled: true,
        role: 'user',
    },
    {
        _id: '4',
        username: 'bwilson',
        email: 'bwilson@example.com',
        full_name: 'Bob Wilson',
        disabled: false,
        role: 'user',
    },
    {
        _id: '5',
        username: 'aclark',
        email: 'aclark@example.com',
        full_name: 'Alice Clark',
        disabled: false,
        role: 'user',
    },
];
