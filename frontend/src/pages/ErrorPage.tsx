import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

const ErrorPage: React.FC = () => {
    // This hook captures the error thrown from the loader
    const error = useRouteError();
    console.error(error);

    let errorMessage = 'An unexpected error occurred.';
    let errorStatus = 500;

    // The `isRouteErrorResponse` helper checks if the error is a Response object
    // which we threw in our loader.
    if (isRouteErrorResponse(error)) {
        errorMessage = error.data || error.statusText;
        errorStatus = error.status;
    }

    return (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
            <h1>Oops!</h1>
            <p>Sorry, something went wrong.</p>
            <p>
                <i>
                    {errorStatus}: {errorMessage}
                </i>
            </p>
            <Link to="/" style={{ color: 'blue' }}>Go back to Home</Link>
        </div>
    );
};

export default ErrorPage;