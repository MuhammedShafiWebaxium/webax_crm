import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';

import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from '@mui/x-data-grid';
import { useSelector } from 'react-redux';

// Custom toolbar with a dynamic button
const CustomToolbar = ({
  onCustomButtonClick,
  startIcon,
  buttonLabel,
  canFilter,
  canExport,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      {canFilter && <GridToolbarFilterButton />}
      <GridToolbarDensitySelector />
      {canExport && <GridToolbarExport />}
    </GridToolbarContainer>

    {onCustomButtonClick && (
      <Button
        onClick={onCustomButtonClick}
        startIcon={startIcon}
        sx={{
          padding: '8px 12px',
          height: '2.25rem',
          fontSize: '13px',
          marginLeft: 'auto',
        }}
      >
        {buttonLabel}
      </Button>
    )}
  </div>
);

const BasicDataGrid = ({
  columns,
  rows,
  checkbox,
  length,
  onCustomButtonClick,
  startIcon,
  buttonLabel = 'Custom Action',
  getRowHeight,
  classNames,
}) => {
  const { currentUser } = useSelector((state) => state.user);

  // Permission flags (adjust keys as per your permissions structure)
  const canFilter = currentUser?.role?.permissions?.filters?.allowed;
  const canExport = currentUser?.role?.permissions?.exports?.allowed;

  return (
    <DataGrid
      checkboxSelection={checkbox}
      getRowHeight={getRowHeight}
      rows={rows}
      columns={columns}
      getRowClassName={(params) =>
        `${classNames} ${
          params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
        }`
      }
      initialState={{
        pagination: {
          paginationModel: { pageSize: length ? length : 10 },
        },
      }}
      scrollbarSize={0}
      pageSizeOptions={[10, 15, 20, 50]}
      slots={{
        toolbar: (props) => (
          <CustomToolbar
            {...props}
            onCustomButtonClick={onCustomButtonClick}
            startIcon={startIcon}
            buttonLabel={buttonLabel}
            canFilter={canFilter}
            canExport={canExport}
          />
        ),
      }}
      disableColumnResize
      density="compact"
      slotProps={{
        filterPanel: {
          filterFormProps: {
            logicOperatorInputProps: {
              variant: 'outlined',
              size: 'small',
            },
            columnInputProps: {
              variant: 'outlined',
              size: 'small',
              sx: { mt: 'auto' },
            },
            operatorInputProps: {
              variant: 'outlined',
              size: 'small',
              sx: { mt: 'auto' },
            },
            valueInputProps: {
              InputComponentProps: {
                variant: 'outlined',
                size: 'small',
              },
            },
          },
        },
      }}
    />
  );
};
export default BasicDataGrid;
