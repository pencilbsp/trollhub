import { FormProvider as Form, type UseFormReturn } from 'react-hook-form';

// ----------------------------------------------------------------------

type Props = {
    className?: string;
    onSubmit?: VoidFunction;
    children: React.ReactNode;
    methods: UseFormReturn<any>;
};

export default function FormProvider({ children, onSubmit, methods, className }: Props) {
    return (
        <Form {...methods}>
            <form onSubmit={onSubmit} className={className}>
                {children}
            </form>
        </Form>
    );
}
