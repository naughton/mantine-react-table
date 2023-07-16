import { Flex, Modal, Stack, Text } from '@mantine/core';
import { MRT_EditActionButtons } from '../buttons/MRT_EditActionButtons';
import { MRT_EditCellTextInput } from '../inputs/MRT_EditCellTextInput';
import { type MRT_Row, type MRT_TableInstance } from '../types';

interface Props<TData extends Record<string, any> = {}> {
  open: boolean;
  table: MRT_TableInstance<TData>;
}

export const MRT_EditRowModal = <TData extends Record<string, any> = {}>({
  open,
  table,
}: Props<TData>) => {
  const {
    getState,
    options: {
      localization,
      onEditingRowCancel,
      onCreatingRowCancel,
      renderEditRowModalContent,
      renderCreateRowModalContent,
      mantineCreateRowModalProps,
      mantineEditRowModalProps,
    },
    setEditingRow,
    setCreatingRow,
  } = table;
  const { creatingRow, editingRow } = getState();
  const row = (creatingRow ?? editingRow) as MRT_Row<TData>;

  const createModalProps =
    mantineCreateRowModalProps instanceof Function
      ? mantineCreateRowModalProps({ row, table })
      : mantineCreateRowModalProps;

  const editModalProps =
    mantineEditRowModalProps instanceof Function
      ? mantineEditRowModalProps({ row, table })
      : mantineEditRowModalProps;

  const modalProps = {
    ...editModalProps,
    ...(creatingRow && createModalProps),
  };

  const internalEditComponents = row
    .getAllCells()
    .filter((cell) => cell.column.columnDef.columnDefType === 'data')
    .map((cell) => (
      <MRT_EditCellTextInput cell={cell} key={cell.id} table={table} />
    ));

  return (
    <Modal
      closeOnClickOutside={false}
      onClose={() => {
        if (creatingRow) {
          onCreatingRowCancel?.({ row, table });
          setCreatingRow(null);
        } else {
          onEditingRowCancel?.({ row, table });
          setEditingRow(null);
        }
      }}
      opened={open}
      withCloseButton={false}
      {...modalProps}
      key={row.id}
    >
      {((creatingRow &&
        renderCreateRowModalContent?.({
          row,
          table,
          internalEditComponents,
        })) ||
        renderEditRowModalContent?.({
          row,
          table,
          internalEditComponents,
        })) ?? (
        <>
          <Text sx={{ textAlign: 'center' }}>
            {(creatingRow && localization.create) || localization.edit}
          </Text>
          <form onSubmit={(e) => e.preventDefault()}>
            <Stack
              sx={{
                gap: '24px',
                paddingTop: '16px',
                width: '100%',
              }}
            >
              {internalEditComponents}
            </Stack>
          </form>
          <Flex sx={{ paddingTop: '24px', justifyContent: 'flex-end' }}>
            <MRT_EditActionButtons row={row} table={table} variant="text" />
          </Flex>
        </>
      )}
    </Modal>
  );
};