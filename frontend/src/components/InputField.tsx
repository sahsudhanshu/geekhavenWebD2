export const InputField = ({ id, type, placeholder, icon, value, onChange }: { id: string; type: string; placeholder: string; icon: React.ReactNode; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }) => (
    <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {icon}
        </div>
        <input
            id={id}
            name={id}
            type={type}
            required
            value={value}
            onChange={onChange}
            className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 dark:text-white bg-gray-100 dark:bg-slate-700 placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-sky-500 sm:text-sm sm:leading-6"
            placeholder={placeholder}
        />
    </div>
);