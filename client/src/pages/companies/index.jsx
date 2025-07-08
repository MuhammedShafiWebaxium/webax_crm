import React, { useEffect, useState } from 'react';
import { getAllCompanies, deleteCompany } from '../../services/companyServices';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { startLoading, stopLoading } from '../../redux/loadingSlice';
import { handleFormError } from '../../utils/handleFormError';
import { formatDate, renderStatus } from '../../internals/data/GridData';
import { Box, Link, Stack, Typography, useTheme } from '@mui/material';
import BasicDataGrid from '../../components/CustomComponents/BasicDataGrid';

const CompaniesList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentUser } = useSelector((state) => state.user);
  const permissions = currentUser?.role?.permissions?.companies || {};

  const [companies, setCompanies] = useState([]);

  const handleEdit = (id) => {
    navigate(`/companies/${id}/edit`);
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await deleteCompany(id);

      if (data.status) {
        dispatch(
          showAlert({
            type: 'success',
            message: `Company Deleted Successfully!`,
          })
        );

        setCompanies((prevCompanies) =>
          prevCompanies.filter((company) => String(company?.id) !== String(id))
        );
      } else {
        throw new Error('Something went wrong.');
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  const renderButton = (onClick, text, disabled) => (
    <Link
      component={'button'}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        textDecoration: 'none',
        color: disabled
          ? theme.palette.text.disabled
          : theme.palette.mode === 'dark'
          ? '#4e9cff'
          : 'blue',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {text}
    </Link>
  );

  const AllCompaniesColumns = [
    { field: 'name', headerName: 'Company', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => renderStatus(params.value),
    },
    { field: 'createdBy', headerName: 'Created By', flex: 1 },
    { field: 'createdAt', headerName: 'Created At', flex: 1 },
    { field: 'staffAndLimit', headerName: 'Staffs (Limit)', flex: 1 },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          {permissions.update &&
            renderButton(() => handleEdit(params.row.id), 'Edit')}
          {permissions.delete &&
            renderButton(() => handleDelete(params.row.id), 'Delete')}
        </Stack>
      ),
    },
  ];

  const formatCompanies = (companyList) =>
    companyList.map((company) => ({
      id: company?._id ?? 'N/A',
      name: company?.name ?? 'N/A',
      createdBy: company?.createdBy?.name ?? 'N/A',
      createdAt: formatDate(company?.createdAt),
      phone: company?.phone ?? 'N/A',
      email: company?.email ?? 'N/A',
      status: company?.status ?? 'N/A',
      source: company?.source ?? 'N/A',
      industry: company?.industry ?? 'N/A',
      staffLimit: company?.staffLimit ?? 'N/A',
      staffAndLimit: `${company?.users?.length} (${company?.staffLimit})`,
    }));

  useEffect(() => {
    const fetchData = async () => {
      if (!permissions.read) return;

      dispatch(startLoading());

      try {
        const { data } = await getAllCompanies();

        setCompanies(formatCompanies(data.companies));
      } catch (error) {
        handleFormError(error, null, dispatch, navigate);
      } finally {
        dispatch(stopLoading());
      }
    };

    fetchData();
  }, [permissions.read]);

  return (
    <Box>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>

      <BasicDataGrid
        columns={AllCompaniesColumns}
        rows={companies}
        checkbox={false}
      />
    </Box>
    // <div className="p-4">
    //   <h2 className="text-xl font-semibold mb-4">Company List</h2>
    //   <div className="overflow-x-auto">
    //     <table className="min-w-full border-collapse border border-gray-300">
    //       <thead>
    //         <tr className="bg-gray-100">
    //           <th className="border border-gray-300 p-2">Name</th>
    //           <th className="border border-gray-300 p-2">Email</th>
    //           <th className="border border-gray-300 p-2">Phone</th>
    //           <th className="border border-gray-300 p-2">Actions</th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {companies.map((company) => (
    //           <tr key={company._id} className="hover:bg-gray-50">
    //             <td className="border border-gray-300 p-2">{company.name}</td>
    //             <td className="border border-gray-300 p-2">{company.email}</td>
    //             <td className="border border-gray-300 p-2">{company.phone}</td>
    //             <td className="border border-gray-300 p-2">
    //               <button
    //                 onClick={() => handleEdit(company._id)}
    //                 className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
    //               >
    //                 Edit
    //               </button>
    //               <button
    //                 onClick={() => handleDelete(company._id)}
    //                 className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
    //               >
    //                 Delete
    //               </button>
    //             </td>
    //           </tr>
    //         ))}
    //       </tbody>
    //     </table>
    //   </div>
    // </div>
  );
};

export default CompaniesList;
