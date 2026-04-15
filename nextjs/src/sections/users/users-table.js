// noinspection JSIgnoredPromiseFromCall,JSUnresolvedReference

import React, {useState} from 'react';
import {
    Box,
    Fab,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    TextField,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UserDialog from "@/sections/users/user-dialog";
import {useAuth} from "@/api/auth/auth-context";
import AddIcon from '@mui/icons-material/Add';
import toast from "react-hot-toast";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {dummyUsers} from "@/api/dummy-data";

export const initialUser = {
    "username": '',
    "email": '',
    "full_name": '',
    "disabled": false,
    "role": 'user',
    "password": ''
}

function UserTable() {
    const {accessToken} = useAuth();
    const [users, setUsers] = useState(dummyUsers);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortField, setSortField] = useState('username');
    const [sortDirection, setSortDirection] = useState('asc');
    const [searchQuery, setSearchQuery] = useState('');

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Function to open the dialog in "add user" mode
    const handleAddUser = () => {
        setCurrentUser(initialUser);
        setOpenDialog(true);
    };

    const handleEdit = (user) => {
        setCurrentUser(user);
        setOpenDialog(true);
    };

    const handleDelete = (id) => {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        toast.success('User deleted successfully!');
    };

    const onSave = (userData) => {
        if (userData._id) {
            setUsers((prev) => prev.map((u) => u._id === userData._id ? userData : u));
            toast.success('User updated successfully!');
        } else {
            const newUser = {...userData, _id: String(Date.now())};
            setUsers((prev) => [...prev, newUser]);
            toast.success('User created successfully!');
        }
        setOpenDialog(false);
        setCurrentUser(null);
    };

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;

    const handleSortRequest = (field) => {
        const isAsc = sortField === field && sortDirection === 'asc';
        setSortDirection(isAsc ? 'desc' : 'asc');
        setSortField(field);
    };

    const filteredAndSortedUsers = users?.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (typeof aValue === 'boolean') {
            aValue = aValue ? 1 : 0;
            bValue = bValue ? 1 : 0;
        } else if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
            return sortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
    }) || [];

    return (
        <>
            <Box sx={{mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <TextField
                    label="Search"
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Tooltip title={"Add new user"}>
                    <Fab size="small" color="primary" aria-label="add" onClick={handleAddUser}>
                        <AddIcon/>
                    </Fab>
                </Tooltip>
            </Box>
            <TableContainer component={Paper} sx={{mt: 3}}>
                <Table aria-label="user table">
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={sortField === 'disabled'} // Assuming 'disabled' is used for status
                                    direction={sortField === 'disabled' ? sortDirection : 'asc'}
                                    onClick={() => handleSortRequest('disabled')} // Adjust if using another property
                                >
                                    Status
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortField === 'username'}
                                    direction={sortField === 'username' ? sortDirection : 'asc'}
                                    onClick={() => handleSortRequest('username')}
                                >
                                    Username
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortField === 'email'}
                                    direction={sortField === 'email' ? sortDirection : 'asc'}
                                    onClick={() => handleSortRequest('email')}
                                >
                                    Email
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortField === 'full_name'}
                                    direction={sortField === 'full_name' ? sortDirection : 'asc'}
                                    onClick={() => handleSortRequest('full_name')}
                                >
                                    Full Name
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortField === 'role'}
                                    direction={sortField === 'role' ? sortDirection : 'asc'}
                                    onClick={() => handleSortRequest('role')}
                                >
                                    Role
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            (rowsPerPage > 0
                                    ? filteredAndSortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    : filteredAndSortedUsers
                            ).map((user) => (
                            <TableRow key={user._id}>
                                <TableCell>
                                    {user.disabled ? (
                                        <Tooltip title="Disabled">
                                            <IconButton>
                                                <RemoveCircleOutlineIcon color="error"/>
                                            </IconButton>
                                        </Tooltip>
                                    ) : (
                                        <Tooltip title="Active">
                                            <IconButton>
                                                <CheckCircleOutlineIcon color="success"/>
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.full_name}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell align="right">
                                    <Tooltip title={"Edit the user"}>
                                    <IconButton disabled={user.role === "owner"} onClick={() => handleEdit(user)}><EditIcon/></IconButton>
                                    </Tooltip>
                                    <Tooltip title={"Delete the user"}>
                                    <IconButton disabled={user.role === "owner"} onClick={() => handleDelete(user._id)}><DeleteIcon/></IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {emptyRows > 0 && (
                            <TableRow style={{height: 53 * emptyRows}}>
                                <TableCell colSpan={6}/>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50, {value: -1, label: 'All'}]}
                    component="div"
                    count={users.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
            {currentUser && (
                <UserDialog
                    open={openDialog}
                    setOpen={setOpenDialog}
                    user={currentUser}
                    onSave={onSave}
                />
            )}
        </>
    );
}

export default UserTable;
