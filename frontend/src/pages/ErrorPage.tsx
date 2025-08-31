import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

const ErrorPage: React.FC = () => {
    const error = useRouteError();
    let errorMessage = 'An unexpected error occurred.';
    let errorStatus = 500;
    if (isRouteErrorResponse(error)) {
        errorMessage = (error as any).data || error.statusText;
        errorStatus = error.status;
    }
    return (
        <div className="text-center py-20 px-6">
            <h1 className="text-3xl font-semibold mb-2">Oops!</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Sorry, something went wrong.</p>
            <p className="italic text-sm text-gray-500 dark:text-gray-500 mb-6">{errorStatus}: {errorMessage}</p>
            <Link to="/" className="text-accent-600 dark:text-accent-400 hover:underline">Go back to Home</Link>
        </div>
    );
};

export default ErrorPage;