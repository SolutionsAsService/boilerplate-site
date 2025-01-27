export default function ContactForm() {
  return (
    <form className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          type="text"
          id="name"
          className="w-full border border-gray-300 rounded-lg p-2"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          className="w-full border border-gray-300 rounded-lg p-2"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-2"
        ></textarea>
      </div>
      <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
        Submit
      </button>
    </form>
  );
}
