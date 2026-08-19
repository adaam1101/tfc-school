import { User } from "../models/User.js";
import { Group } from "../models/Group.js";
import { Payment } from "../models/Payment.js";

export const RAW_ADAM_STUDENTS = [
  // --- Sheet 1 ---
  {
    name: "فقيه يامنى",
    username: "fkih.yamna",
    phone: "0667073976",
    parentPhone: "0667073976",
    paidAmount: 7500,
    assurancePaid: false,
    notes: "تم دفع كامل المبلغ 7500 دج"
  },
  {
    name: "شريفي أميمة",
    username: "cherifi.oumaima",
    phone: "0664896581",
    parentPhone: "0664896581",
    paidAmount: 5500,
    assurancePaid: true,
    notes: "الدفعة 1: 3500 دج + الدفعة 2: 2000 دج + حقوق تسجيل 800 دج"
  },
  {
    name: "بوقاجية أسماء",
    username: "boukadjia.asma",
    phone: "0791892663",
    parentPhone: "0791892663",
    paidAmount: 2000,
    assurancePaid: true,
    notes: "الدفعة 1: 2000 دج + حقوق تسجيل 800 دج"
  },
  {
    name: "يوسفي جيهان",
    username: "yousfi.jihan",
    phone: "0558631454",
    parentPhone: "0558631454",
    paidAmount: 3000,
    assurancePaid: false,
    notes: "الدفعة 1: 3000 دج"
  },
  {
    name: "صفصاف إسكندر",
    username: "safsaf.iskander",
    phone: "0673300390",
    parentPhone: "0673300390",
    paidAmount: 7000,
    assurancePaid: false,
    notes: "الدفعة 1: 7000 دج"
  },

  // --- Sheet 2 (Adem A1) ---
  {
    name: "طراد دينا",
    username: "trad.dina",
    phone: "0661986093",
    parentPhone: "0661986093",
    paidAmount: 4000,
    assurancePaid: false,
    notes: "الدفعة 1: 4000 دج"
  },
  {
    name: "مراح آية",
    username: "merah.aya",
    phone: "0660000001",
    parentPhone: "0660000001",
    paidAmount: 2500,
    assurancePaid: false,
    notes: "الدفعة 1: 2500 دج"
  },
  {
    name: "مرحباوي أميمة",
    username: "merhabaoui.oumaima",
    phone: "0660000002",
    parentPhone: "0660000002",
    paidAmount: 2500,
    assurancePaid: false,
    notes: "الدفعة 1: 2500 دج"
  },
  {
    name: "كلبي دعاء",
    username: "kelbi.douaa",
    phone: "0656230032",
    parentPhone: "0656230032",
    paidAmount: 2500,
    assurancePaid: false,
    notes: "الدفعة 1: 2500 دج"
  },
  {
    name: "حاج عمار نور الهدى",
    username: "hadj.ammar.nour",
    phone: "0776907068",
    parentPhone: "0776907068",
    paidAmount: 7500,
    assurancePaid: true,
    notes: "خالص كامل المبلغ 7500 دج + حقوق تسجيل 800 دج"
  },
  {
    name: "زيتوني وصال",
    username: "zitouni.ouissal",
    phone: "0665817156",
    parentPhone: "0665817156",
    paidAmount: 7500,
    assurancePaid: true,
    notes: "خالص كامل المبلغ 7500 دج + حقوق تسجيل 800 دج"
  },
  {
    name: "بلونيس إيناس",
    username: "belounis.ines",
    phone: "0664146581",
    parentPhone: "0664146581",
    paidAmount: 3500,
    assurancePaid: false,
    notes: "الدفعة 1: 3500 دج"
  },
  {
    name: "مادي دعاء",
    username: "madi.douaa",
    phone: "0668640119",
    parentPhone: "0668640119",
    paidAmount: 5000,
    assurancePaid: false,
    notes: "الدفعة 1: 5000 دج"
  },
  {
    name: "يحياوي نزار",
    username: "yahiaoui.nizar",
    phone: "0792001110",
    parentPhone: "0792001110",
    paidAmount: 3500,
    assurancePaid: false,
    notes: "الدفعة 1: 3500 دج"
  },
  {
    name: "حوابلية تقي",
    username: "houablia.taki",
    phone: "0557506638",
    parentPhone: "0557506638",
    paidAmount: 3500,
    assurancePaid: false,
    notes: "الدفعة 1: 3500 دج"
  },
  {
    name: "صايفي مريم",
    username: "saifi.meriem",
    phone: "0668019092",
    parentPhone: "0668019092",
    paidAmount: 4000,
    assurancePaid: false,
    notes: "الدفعة 1: 4000 دج"
  },
  {
    name: "خراط ريتاج",
    username: "kharat.ritedj",
    phone: "0772559452",
    parentPhone: "0772559452",
    paidAmount: 2000,
    assurancePaid: true,
    notes: "الدفعة 1: 2000 دج + حقوق تسجيل 800 دج"
  },
  {
    name: "منشري ليلى",
    username: "menchari.leila",
    phone: "0782223487",
    parentPhone: "0782223487",
    paidAmount: 3000,
    assurancePaid: false,
    notes: "الدفعة 1: 3000 دج"
  },
  {
    name: "مالكية إيمان",
    username: "malkia.imen",
    phone: "0776780629",
    parentPhone: "0776780629",
    paidAmount: 7500,
    assurancePaid: false,
    notes: "خالص كامل المبلغ 7500 دج"
  },
  {
    name: "زوواج نورهان",
    username: "zouadj.nourhane",
    phone: "0655427802",
    parentPhone: "0655427802",
    paidAmount: 2000,
    assurancePaid: true,
    notes: "الدفعة 1: 2000 دج + حقوق تسجيل 800 دج"
  },
  {
    name: "مالكي حورية",
    username: "malki.houria",
    phone: "0556106016",
    parentPhone: "0556106016",
    paidAmount: 4000,
    assurancePaid: false,
    notes: "الدفعة 1: 2000 دج + الدفعة 2: 2000 دج"
  },
  {
    name: "مالكي عبد العزيز",
    username: "malki.abdelaziz",
    phone: "0660000003",
    parentPhone: "0660000003",
    paidAmount: 2400,
    assurancePaid: false,
    notes: "الدفعة 1: 2400 دج"
  },
  {
    name: "مسني عناق",
    username: "mesni.annak",
    phone: "0556072568",
    parentPhone: "0556072568",
    paidAmount: 4000,
    assurancePaid: true,
    notes: "الدفعة 1: 2000 دج + الدفعة 2: 2000 دج + حقوق تسجيل 800 دج"
  }
];

export const bootstrapAdamA1 = async () => {
  try {
    // 1. Locate Teacher Adam / Adem
    let adam = await User.findOne({
      role: "teacher",
      $or: [
        { name: { $regex: /adam|ameyoud|adem/i } },
        { email: { $regex: /adam|ameyoud/i } }
      ]
    });

    if (!adam) {
      // Create Teacher Adam if not found
      adam = await User.create({
        role: "teacher",
        name: "Ameyoud Adam",
        email: "adam@tfcschool.dz",
        password: "Teacher@12345",
        status: "active",
        teacherProfile: {
          subject: "English - A1",
          contactInfo: "0555000000"
        }
      });
      console.log("Created Teacher Adam account: adam@tfcschool.dz");
    }

    // 2. Locate or create Group "A1 New Group"
    let a1Group = await Group.findOne({
      teacher: adam._id,
      name: { $regex: /A1 New Group|A1 - G1|A1/i }
    });

    if (!a1Group) {
      a1Group = await Group.create({
        name: "A1 New Group",
        description: "Groupe A1 - Enseignant Adam Ameyoud",
        teacher: adam._id,
        students: [],
        color: "#3B82F6",
        days: ["Sunday", "Tuesday", "Thursday"]
      });
      console.log("Created group A1 New Group for Teacher Adam");
    }

    const studentObjectIds = [];

    // 3. Process all 23 students
    for (const raw of RAW_ADAM_STUDENTS) {
      let student = await User.findOne({
        $or: [
          { name: raw.name },
          { username: raw.username },
          { email: raw.username + "@tfc.local" }
        ]
      });

      if (!student) {
        student = await User.create({
          role: "student",
          name: raw.name,
          username: raw.username,
          email: raw.username + "@tfc.local",
          password: "Student@12345",
          phone: raw.phone,
          status: "active",
          studentProfile: {
            course: "A1",
            teacher: adam._id,
            parentName: raw.name + " (Parent)",
            parentPhone: raw.parentPhone,
            sessionsAttended: 0,
            isStopped: false,
            enrollmentDate: new Date("2026-07-01")
          }
        });
      } else {
        // Enforce assignment strictly to Teacher Adam
        if (!student.studentProfile) student.studentProfile = {};
        student.studentProfile.teacher = adam._id;
        student.studentProfile.course = "A1";
        if (raw.parentPhone && !student.studentProfile.parentPhone) {
          student.studentProfile.parentPhone = raw.parentPhone;
        }
        await student.save();
      }

      studentObjectIds.push(student._id);

      // 4. Create or update payment for August 2026 (and July 2026)
      for (const m of ["2026-08", "2026-07"]) {
        const periodName = m === "2026-08" ? "August 2026" : "July 2026";
        let payment = await Payment.findOne({ student: student._id, month: m });

        const tuitionFee = 7500;
        const paid = raw.paidAmount;
        const assuranceFee = 800;
        const isAssurancePaid = Boolean(raw.assurancePaid);

        if (!payment) {
          await Payment.create({
            student: student._id,
            teacher: adam._id,
            month: m,
            period: periodName,
            amount: tuitionFee,
            paidAmount: paid,
            restAmount: Math.max(0, tuitionFee - paid),
            assuranceAmount: assuranceFee,
            assurancePaid: isAssurancePaid,
            assurancePaidAmount: isAssurancePaid ? assuranceFee : 0,
            status: paid >= tuitionFee ? "paid" : paid > 0 ? "partial" : "unpaid",
            notes: raw.notes || "",
            method: "cash",
            recordedBy: adam._id
          });
        } else {
          payment.teacher = adam._id;
          payment.amount = tuitionFee;
          payment.paidAmount = paid;
          payment.restAmount = Math.max(0, tuitionFee - paid);
          payment.assuranceAmount = assuranceFee;
          payment.assurancePaid = isAssurancePaid;
          payment.assurancePaidAmount = isAssurancePaid ? assuranceFee : 0;
          payment.status = paid >= tuitionFee ? "paid" : paid > 0 ? "partial" : "unpaid";
          if (!payment.notes) payment.notes = raw.notes;
          await payment.save();
        }
      }
    }

    // 5. Update Teacher Adam's assigned students list
    await User.findByIdAndUpdate(adam._id, {
      $addToSet: { "teacherProfile.assignedStudents": { $each: studentObjectIds } }
    });

    // 6. Update Group "A1 New Group" with all student IDs
    a1Group.students = studentObjectIds;
    await a1Group.save();

    // 7. Ensure no other teachers accidentally have these students assigned
    await User.updateMany(
      { role: "teacher", _id: { $ne: adam._id } },
      { $pullAll: { "teacherProfile.assignedStudents": studentObjectIds } }
    );

    console.log(`Successfully bootstrapped ${studentObjectIds.length} students in "A1 New Group" strictly for Teacher Adam with organized payments! 🎓`);
  } catch (err) {
    console.error("Error in bootstrapAdamA1:", err);
  }
};
