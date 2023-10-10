import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AlertProps {
  isShown: boolean;
  children: React.ReactNode;
  handleOkButtonClick: () => void;
}

const Alert: React.FC<AlertProps> = ({
  children,
  isShown,
  handleOkButtonClick,
}) => {
  return (
    <AlertDialog open={isShown}>
      {children}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Your file has been cracked successfully.
          </AlertDialogTitle>
          <AlertDialogDescription>
            You will find a UNPROTECTED version of your excel file in the same
            folder as the original.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* <AlertDialogCancel>Cancel</AlertDialogCancel> */}
          <AlertDialogAction onClick={handleOkButtonClick}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { Alert };
