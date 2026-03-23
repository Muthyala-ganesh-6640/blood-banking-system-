const mongoose = require('mongoose');
const { mongoUri } = require('./config/config');
const User = require('./models/User');
const Admin = require('./models/Admin');
const Hospital = require('./models/Hospital');
const Doctor = require('./models/Doctor');
const Treatment = require('./models/Treatment');
const BloodStock = require('./models/BloodStock');

async function seed() {
  await mongoose.connect(mongoUri);

  await Promise.all([
    User.deleteMany({}),
    Admin.deleteMany({}),
    Hospital.deleteMany({}),
    Doctor.deleteMany({}),
    Treatment.deleteMany({}),
    BloodStock.deleteMany({})
  ]);

  const adminUser = await User.create({
    name: 'Super Admin',
    email: 'admin@smartbloodbank.local',
    password: 'Admin@123',
    role: 'admin'
  });

  await Admin.create({ user: adminUser._id, permissions: ['*'] });

  const treatment1 = await Treatment.create({
    name: 'Cardiology',
    description: 'Heart and vascular treatments'
  });
  const treatment2 = await Treatment.create({
    name: 'Oncology',
    description: 'Cancer treatment and chemotherapy'
  });

  const hospital1 = await Hospital.create({
    name: 'City Care Hospital',
    address: '123 Main Street, Metropolis',
    contactNumber: '9876543210',
    emergencyHelpline: '1800-111-222',
    treatments: [treatment1._id, treatment2._id],
    location: { city: 'Metropolis', state: 'StateA', pincode: '123456' }
  });

  const doctor1 = await Doctor.create({
    name: 'Dr. John Doe',
    specialization: 'Cardiology',
    hospital: hospital1._id,
    availableTimings: '10:00 AM - 4:00 PM',
    contactNumber: '9876500001'
  });

  hospital1.doctors.push(doctor1._id);
  await hospital1.save();

  await BloodStock.insertMany([
    { hospital: hospital1._id, bloodGroup: 'A+', units: 10 },
    { hospital: hospital1._id, bloodGroup: 'B+', units: 5 },
    { hospital: hospital1._id, bloodGroup: 'O-', units: 2 }
  ]);

  // Additional Hyderabad hospitals and doctors
  const hospitalDefs = [
    {
      name: 'Apollo Hospitals',
      address: 'Apollo Hospitals, Jubilee Hills, Hyderabad',
      city: 'Jubilee Hills',
      doctors: [
        { name: 'Dr. Suresh Rao', specialization: 'Cardiology' },
        { name: 'Dr. Lakshmi Priya', specialization: 'Gynecology' },
        { name: 'Dr. Anil Kumar', specialization: 'Neurology' }
      ]
    },
    {
      name: 'Yashoda Hospitals',
      address: 'Yashoda Hospitals, Somajiguda, Hyderabad',
      city: 'Somajiguda',
      doctors: [
        { name: 'Dr. Ravi Kumar', specialization: 'Cardiology' },
        { name: 'Dr. Kavitha Reddy', specialization: 'Pediatrics' },
        { name: 'Dr. Mahesh Babu', specialization: 'Gastroenterology' }
      ]
    },
    {
      name: 'Care Hospitals',
      address: 'Care Hospitals, Banjara Hills, Hyderabad',
      city: 'Banjara Hills',
      doctors: [
        { name: 'Dr. Ramesh Gupta', specialization: 'Cardiothoracic Surgery' },
        { name: 'Dr. Divya Rani', specialization: 'ENT' },
        { name: 'Dr. Sandeep Kumar', specialization: 'Urology' }
      ]
    },
    {
      name: 'KIMS Hospitals',
      address: 'KIMS Hospitals, Secunderabad, Hyderabad',
      city: 'Secunderabad',
      doctors: [
        { name: 'Dr. Kiran Kumar', specialization: 'Neurology' },
        { name: 'Dr. Anusha Devi', specialization: 'Obstetrics & Gynecology' },
        { name: 'Dr. Rajesh Reddy', specialization: 'Orthopedics' }
      ]
    },
    {
      name: 'Continental Hospitals',
      address: 'Continental Hospitals, Gachibowli, Hyderabad',
      city: 'Gachibowli',
      doctors: [
        { name: 'Dr. Arvind Kumar', specialization: 'Internal Medicine' },
        { name: 'Dr. Deepika Reddy', specialization: 'Cardiology' },
        { name: 'Dr. Vikram Singh', specialization: 'Neurosurgery' }
      ]
    },
    {
      name: 'AIG Hospitals',
      address: 'AIG Hospitals, Hyderabad',
      city: 'Hyderabad',
      doctors: [
        { name: 'Dr. Praveen Rao', specialization: 'Gastroenterology' },
        { name: 'Dr. Sneha Reddy', specialization: 'Hepatology' },
        { name: 'Dr. Manish Gupta', specialization: 'Oncology' }
      ]
    },
    {
      name: 'Sunshine Hospitals',
      address: 'Sunshine Hospitals, Hyderabad',
      city: 'Hyderabad',
      doctors: [
        { name: 'Dr. Mohan Reddy', specialization: 'Orthopedics' },
        { name: 'Dr. Pooja Sharma', specialization: 'Endocrinology' },
        { name: 'Dr. Naveen Kumar', specialization: 'Pulmonology' }
      ]
    },
    {
      name: 'Global Hospitals',
      address: 'Global Hospitals, Hyderabad',
      city: 'Hyderabad',
      doctors: [
        { name: 'Dr. Shyam Prasad', specialization: 'Nephrology' },
        { name: 'Dr. Swathi Rani', specialization: 'Cardiology' },
        { name: 'Dr. Harish Kumar', specialization: 'Liver Transplant' }
      ]
    },
    {
      name: 'Star Hospitals',
      address: 'Star Hospitals, Hyderabad',
      city: 'Hyderabad',
      doctors: [
        { name: 'Dr. Ajay Kumar', specialization: 'General Surgery' },
        { name: 'Dr. Meghana Rao', specialization: 'Dermatology' },
        { name: 'Dr. Ritu Sharma', specialization: 'Pediatrics' }
      ]
    },
    {
      name: 'Medicover Hospitals',
      address: 'Medicover Hospitals, Hyderabad',
      city: 'Hyderabad',
      doctors: [
        { name: 'Dr. Sandeep Rao', specialization: 'Neurology' },
        { name: 'Dr. Kavya Reddy', specialization: 'Gynecology' },
        { name: 'Dr. Vinay Kumar', specialization: 'Orthopedics' }
      ]
    },
    {
      name: "Rainbow Children's Hospital",
      address: "Rainbow Children's Hospital, Hyderabad",
      city: 'Hyderabad',
      doctors: [
        { name: 'Dr. Rakesh Kumar', specialization: 'Pediatrics' },
        { name: 'Dr. Priya Nair', specialization: 'Neonatology' },
        { name: 'Dr. Sunitha Reddy', specialization: 'Pediatric Surgery' }
      ]
    },
    {
      name: 'Kamineni Hospitals',
      address: 'Kamineni Hospitals, Hyderabad',
      city: 'Hyderabad',
      doctors: [
        { name: 'Dr. Mahesh Rao', specialization: 'Cardiology' },
        { name: 'Dr. Shilpa Rani', specialization: 'ENT' },
        { name: 'Dr. Arjun Reddy', specialization: 'General Medicine' }
      ]
    },
    {
      name: 'Niloufer Hospital',
      address: 'Niloufer Hospital, Hyderabad',
      city: 'Hyderabad',
      doctors: [
        { name: 'Dr. Ayesha Begum', specialization: 'Pediatrics' },
        { name: 'Dr. Imran Khan', specialization: 'Child Specialist' },
        { name: 'Dr. Farah Ali', specialization: 'Neonatology' }
      ]
    },
    {
      name: 'Osmania General Hospital',
      address: 'Osmania General Hospital, Hyderabad',
      city: 'Hyderabad',
      doctors: [
        { name: 'Dr. Srinivas Rao', specialization: 'General Surgery' },
        { name: 'Dr. Lakshman', specialization: 'Orthopedics' },
        { name: 'Dr. Rafi Ahmed', specialization: 'Internal Medicine' }
      ]
    },
    {
      name: 'Gandhi Hospital',
      address: 'Gandhi Hospital, Hyderabad',
      city: 'Hyderabad',
      doctors: [
        { name: 'Dr. Naveen Reddy', specialization: 'General Medicine' },
        { name: 'Dr. Bhaskar Rao', specialization: 'Cardiology' },
        { name: 'Dr. Anitha Devi', specialization: 'Gynecology' }
      ]
    },
    {
      name: 'Princess Esra Hospital',
      address: 'Princess Esra Hospital, Hyderabad',
      city: 'Hyderabad',
      doctors: [
        { name: 'Dr. Salman Khan', specialization: 'Internal Medicine' },
        { name: 'Dr. Meena Sharma', specialization: 'Obstetrics' },
        { name: 'Dr. Rakesh Verma', specialization: 'Surgery' }
      ]
    },
    {
      name: 'Apollo Spectra Hospitals',
      address: 'Apollo Spectra Hospitals, Hyderabad',
      city: 'Hyderabad',
      doctors: [
        { name: 'Dr. Rohit Reddy', specialization: 'Orthopedics' },
        { name: 'Dr. Pavan Kumar', specialization: 'Urology' },
        { name: 'Dr. Shruti Mehta', specialization: 'ENT' }
      ]
    },
    {
      name: 'Omega Hospitals',
      address: 'Omega Hospitals, Hyderabad',
      city: 'Hyderabad',
      doctors: [
        { name: 'Dr. Karthik Rao', specialization: 'Cardiology' },
        { name: 'Dr. Divya Sharma', specialization: 'Gynecology' },
        { name: 'Dr. Naveen Kumar', specialization: 'Neurology' }
      ]
    },
    {
      name: 'Basavatarakam Cancer Hospital',
      address: 'Basavatarakam Indo American Cancer Hospital, Hyderabad',
      city: 'Hyderabad',
      doctors: [
        { name: 'Dr. Vijay Anand', specialization: 'Oncology' },
        { name: 'Dr. Sushma Reddy', specialization: 'Radiation Oncology' },
        { name: 'Dr. Teja Kumar', specialization: 'Surgical Oncology' }
      ]
    },
    {
      name: 'NIMS',
      address: 'Nizam\'s Institute of Medical Sciences, Punjagutta, Hyderabad',
      city: 'Punjagutta',
      doctors: [
        { name: 'Dr. Srinivas Reddy', specialization: 'Cardiology' },
        { name: 'Dr. Anitha Rao', specialization: 'Neurology' }
      ]
    },
    {
      name: 'Virinchi Hospitals',
      address: 'Virinchi Hospitals, Banjara Hills, Hyderabad',
      city: 'Banjara Hills',
      doctors: [
        { name: 'Dr. Satish Kumar', specialization: 'Internal Medicine' },
        { name: 'Dr. Keerthi Reddy', specialization: 'Orthopedics' }
      ]
    },
    {
      name: 'Image Hospitals',
      address: 'Image Hospitals, Ameerpet, Hyderabad',
      city: 'Ameerpet',
      doctors: [
        { name: 'Dr. Sudheer Reddy', specialization: 'General Surgery' },
        { name: 'Dr. Nikhila Sharma', specialization: 'Gynecology' }
      ]
    },
    {
      name: 'Shalivahana Hospitals',
      address: 'Shalivahana Hospitals, Dilsukhnagar, Hyderabad',
      city: 'Dilsukhnagar',
      doctors: [
        { name: 'Dr. Harsha Vardhan', specialization: 'General Medicine' },
        { name: 'Dr. Snehalatha', specialization: 'Pediatrics' }
      ]
    },
    {
      name: 'Mythri Hospital',
      address: 'Mythri Hospital, Mehdipatnam, Hyderabad',
      city: 'Mehdipatnam',
      doctors: [
        { name: 'Dr. Pradeep Reddy', specialization: 'General Medicine' },
        { name: 'Dr. Swathi Rao', specialization: 'Dermatology' },
        { name: 'Dr. Arun Kumar', specialization: 'Orthopedics' }
      ]
    }
  ];

  for (let i = 0; i < hospitalDefs.length; i += 1) {
    const def = hospitalDefs[i];
    const hospital = await Hospital.create({
      name: def.name,
      address: def.address,
      contactNumber: `98765${(10000 + i).toString().slice(1)}`,
      emergencyHelpline: '1800-111-222',
      treatments: [treatment1._id, treatment2._id],
      location: { city: def.city, state: 'Telangana', pincode: '500000' }
    });

    const doctorDocs = await Promise.all(
      def.doctors.map((d, idx) =>
        Doctor.create({
          name: d.name,
          specialization: d.specialization,
          hospital: hospital._id,
          availableTimings: idx === 0 ? '9:00 AM - 2:00 PM' : '2:00 PM - 8:00 PM',
          contactNumber: `98765${(20000 + i * 3 + idx).toString().slice(1)}`
        })
      )
    );

    hospital.doctors.push(...doctorDocs.map((d) => d._id));
    await hospital.save();
  }

  // eslint-disable-next-line no-console
  console.log('Seed data created successfully');
  await mongoose.disconnect();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

