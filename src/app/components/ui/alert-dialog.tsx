'use client';

import React, { ReactNode, createContext, useContext, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';

// Context for AlertDialog state
interface AlertDialogContextType {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
}

const AlertDialogContext = createContext<AlertDialogContextType | null>(null);

// Main AlertDialog component
interface AlertDialogProps {
  children: ReactNode;
}

export function AlertDialog({ children }: AlertDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => setIsOpen(false);

  return (
    <AlertDialogContext.Provider value={{ isOpen, openDialog, closeDialog }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

// AlertDialog Trigger
interface AlertDialogTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

export function AlertDialogTrigger({ children, asChild }: AlertDialogTriggerProps) {
  const context = useContext(AlertDialogContext);
  if (!context) throw new Error('AlertDialogTrigger must be used within AlertDialog');

  const { openDialog } = context;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: openDialog,
    } as any);
  }

  return (
    <Button onClick={openDialog}>
      {children}
    </Button>
  );
}

// AlertDialog Content
interface AlertDialogContentProps {
  children: ReactNode;
}

export function AlertDialogContent({ children }: AlertDialogContentProps) {
  const context = useContext(AlertDialogContext);
  if (!context) throw new Error('AlertDialogContent must be used within AlertDialog');

  const { isOpen, closeDialog } = context;

  return (
    <Modal isOpen={isOpen} onClose={closeDialog} placement="center">
      <ModalContent>
        {children}
      </ModalContent>
    </Modal>
  );
}

// AlertDialog Header
interface AlertDialogHeaderProps {
  children: ReactNode;
}

export function AlertDialogHeader({ children }: AlertDialogHeaderProps) {
  return (
    <ModalHeader className="flex flex-col gap-1">
      {children}
    </ModalHeader>
  );
}

// AlertDialog Title
interface AlertDialogTitleProps {
  children: ReactNode;
}

export function AlertDialogTitle({ children }: AlertDialogTitleProps) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}

// AlertDialog Description
interface AlertDialogDescriptionProps {
  children: ReactNode;
}

export function AlertDialogDescription({ children }: AlertDialogDescriptionProps) {
  return (
    <ModalBody>
      <p className="text-sm text-gray-600">{children}</p>
    </ModalBody>
  );
}

// AlertDialog Footer
interface AlertDialogFooterProps {
  children: ReactNode;
}

export function AlertDialogFooter({ children }: AlertDialogFooterProps) {
  return (
    <ModalFooter className="flex justify-end space-x-2">
      {children}
    </ModalFooter>
  );
}

// AlertDialog Cancel
interface AlertDialogCancelProps {
  children: ReactNode;
}

export function AlertDialogCancel({ children }: AlertDialogCancelProps) {
  const context = useContext(AlertDialogContext);
  if (!context) throw new Error('AlertDialogCancel must be used within AlertDialog');

  const { closeDialog } = context;

  return (
    <Button color="default" variant="light" onPress={closeDialog}>
      {children}
    </Button>
  );
}

// AlertDialog Action
interface AlertDialogActionProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function AlertDialogAction({ children, onClick, disabled }: AlertDialogActionProps) {
  const context = useContext(AlertDialogContext);
  if (!context) throw new Error('AlertDialogAction must be used within AlertDialog');

  const { closeDialog } = context;

  const handleClick = () => {
    onClick?.();
    closeDialog();
  };

  return (
    <Button 
      color="danger" 
      onPress={handleClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

export default AlertDialog;

