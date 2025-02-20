'use client'
import React, { useState, useEffect } from 'react';
import { Button, message, Steps, Form, Input, Select } from 'antd';
import { CloudFilled, MinusCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/userManipulate';
import Image from 'next/image';
import axios from 'axios';
const { TextArea } = Input;

function CreateTicketForm() {

  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm(); // Retain form state across steps
  const [data, setData] = useState([]);
  const [options, setOptions] = useState([]);
  const [user, setUser] = useState({})
  const [formData, setFormData] = useState({});
  const [equipment, setEquipment] = useState([])
  const [selectedItems, setSelectedItems] = useState([]);


  const fetchUser = async () => {
    let result = {};
    try {
      result = await getUser();
      setUser(result);
      // console.log('user :', result);
      form.setFieldsValue({ name: result.name || '', phone: result.phone || '' });
      // console.log('user id :', result.user_id)
    } catch (error) {
      console.log(error);
    }

    return result;
  }

  const fetchOption = async () => {
    try {
      const usr = await fetchUser();
      if (!usr) throw new Error('No authorized');
      let url = "/api/customer/sites"
      const response = await axios.get(url);

      const mappedOptions = response.data.map(site => ({
        value: site.id,
        label: site.name,
      }));

      setOptions(mappedOptions);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleChange = (selected) => {
    if (selected && selected.value) {
      fetchData(selected.value);
    } else {
      console.log('Selected is undefined or has no value');
    }
  };
  const fetchData = async (id) => {
    try {
      const usr = await fetchUser();
      if (!usr) throw new Error('No authorized');

      let url = `/api/customer/site/${id}`
      const response = await axios.get(url);
      const dataSite = response.data;

      form.setFieldsValue({
        address: dataSite.street || '',
        district: dataSite.street2 || '',
        subdistrict: dataSite.city || '',
        province: dataSite.state_name || '',
        postalCode: dataSite.zip || ''
      })

      const mapEquipment = dataSite.equipments.map(equipments => ({
        value: equipments.id,
        label: equipments.name,
        serial_no: equipments.serial_no
      }));
      setEquipment(mapEquipment);

      setData(dataSite);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    fetchOption();
    handleChange();
    document.body.setAttribute('cz-shortcut-listen', '');

    // eslint-disable-next-line
  }, []);
  const sendLineNotification = async (message) => {
    // console.log("Sending message:", message);
    try {
      const response = await fetch('/api/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        const data = await response.json();
        // console.log('ส่งการแจ้งเตือนไปยัง LINE admin:', data);
      } else {
        const errorData = await response.json(); // รับข้อมูลข้อผิดพลาด
        console.error('เกิดข้อผิดพลาดในการส่งการแจ้งเตือน LINE:', errorData);
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการส่งการแจ้งเตือน LINE:', error);
    }
  };


  const handleChangeEquipments = (selectedOptions) => {
    const updatedSelectedItems = selectedOptions.map(option => ({
      value: option.value,
      label: option.label,
      serial_no: equipment.find(equip => equip.value === option.value)?.serial_no || '', // Find the serial_no
    }));

    // console.log("Updated Selected Items:", updatedSelectedItems);
    setSelectedItems(updatedSelectedItems);
  };

  const handleRemove = (equipToRemove) => {
    const updatedItems = selectedItems.filter(equip => equip.value !== equipToRemove.value);

    setSelectedItems(updatedItems);

    // อัพเดต Select ด้วยค่าที่เหลืออยู่
    const updatedValues = updatedItems.map(item => item.value);
    form.setFieldsValue({ equipment: updatedValues });
  };
  const next = () => {
    form.validateFields().then(() => {
      const currentData = form.getFieldsValue();
      setFormData({ ...formData, ...currentData, ...selectedItems });
      // console.log("formData: ", formData);
      // console.log("currentData: ", currentData);
      // console.log("selectedItems: ", selectedItems);
      setCurrent(current + 1);
    }).catch((errorInfo) => {
      console.log("Validation Failed:", errorInfo);
    });
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const handleDone = async () => {
    form.validateFields().then(async () => {
      const allData = form.getFieldsValue();
      setFormData({ ...formData, ...allData });
      const currentDateTime = new Date().toLocaleString();
      // Create message content including selected items
      const messageContent =
        `*Customer Service Notification*
*Site:* 🔵 ${formData.site.label} 🔵
*Date & Time:* ${currentDateTime}
*Name:* ${formData.name}
*Phone:* ${formData.phone}
*Address:* ${formData.address}, ${formData.district}, ${formData.subdistrict}, ${formData.province}
*Equipment:* 
${selectedItems.map(item => `  - ${item.label} (S/N: ${item.serial_no})`).join('\n')}
*Detail:*
${allData.detail}
`;

      await sendLineNotification(messageContent);
      message.success('Form submitted successfully!');
      form.resetFields();
      router.push('/customer/task');
      // console.log('Success:', formData);
      // console.log('Success:', allData);
    }).catch((errorInfo) => {
      console.log("Validation Failed:", errorInfo);
    });
  };


  const onFinish = async (values) => {
    message.success('การส่งฟอร์มสำเร็จ!');
    form.resetFields();
    setSelectedItems([])
    // console.log('Success:', values);
  };

  const steps = [
    {
      title: 'Address',
      content: (
        <div className="space-y-1">
          <Form.Item style={{ marginBottom: 2 }} label="Site" name="site" rules={[{ required: true, message: 'Please choose your site' }]}>
            <Select
              labelInValue


              style={{
                width: "100%",
              }}
              onChange={handleChange}
              options={options}
            />
          </Form.Item>
          <Form.Item label="Name" name="name" initialValue={user.name || ''} rules={[{ message: 'Please enter your name' }]} >
            <Input readOnly />
          </Form.Item>
          <Form.Item label="Phone" name="phone" initialValue={user.phone || ''} rules={[{ message: 'Please enter your phone number' }]}>
            <Input readOnly />
          </Form.Item>
          <Form.Item label="House No., Village, Lane, Road" name="address" initialValue={data.address || ''} rules={[{ message: 'Please enter your full address' }]}>
            <Input.TextArea readOnly rows={2} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-2">
            <Form.Item label="District" name="district" initialValue={data.district || ''} rules={[{ message: 'Please enter your district/area' }]}>
              <Input readOnly />
            </Form.Item>

            <Form.Item label="Sub-district" name="subdistrict" initialValue={data.subdistrict || ''} rules={[{ message: 'Please enter your sub-district' }]}>
              <Input readOnly />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Form.Item label="Province" name="province" initialValue={data.province || ''} rules={[{ message: 'Please enter your province' }]}>
              <Input readOnly />
            </Form.Item>

            <Form.Item label="Postal Code" name="postalCode" initialValue={data.postalCode || ''} rules={[{ message: 'Please enter your postal code' }]}>
              <Input readOnly />
            </Form.Item>
          </div>
        </div>
      ),
    },
    {
      title: 'Equipment',
      content: (
        <div className="space-y-1 mb-2">
          <Form.Item label="Site" name="site" rules={[{ required: true, message: 'Please choose your site' }]}>
            <Select
              disabled={true}
              labelInValue

              style={{
                width: "100%",
              }}
              onChange={handleChange}
              options={options}
            />

          </Form.Item>

          <Form.Item label="Equipment" name="equipment" rules={[{ required: true, message: 'Please cheoose equipment' }]}>
            <Select
              mode="multiple"
              placeholder="Please select equipment"
              style={{
                flex: 1,
              }}
              options={equipment}
              // value={selectedItems} 
              onChange={(value, option) => handleChangeEquipments(option)}
            />
          </Form.Item>
          <div className="grid sm:grid-cols md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2" >
            {selectedItems.map((equip, index) => (
              <div key={index} className="flex space-x-4 items-center  p-1 w-full h-24 rounded-lg shadow-lg border border-gray-200">
                {/* Display image */}
                <div className='w-24 h-24 p-2'>
                  <Image
                    width={96}
                    height={96}
                    alt="Equipment"
                    src={`/api/image/equipment?id=${equip.value}`}
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                {/* Display equipment label */}
                <div className='bg-pink-500x w-full flex justify-between items-center px-2'>
                  <div className='flex flex-col  px-2'>
                    <span className='font-bold '>{index + 1}. {equip.label}</span>
                    <span><span className='font-bold'>S/N: </span>{equip.serial_no}</span>
                  </div>
                  <div className='flex flex-row justify-end bg-red-700x gap-2 items-center'>
                    <MinusCircleOutlined onClick={() => handleRemove(equip)} />
                  </div>

                </div>
              </div>
            ))}
          </div>


        </div>
      ),
    },
    {
      title: 'Submission',
      content: (
        <div className="space-y-4 p-4 bg-white rounded-lg shadow-md">
          <Form.Item
            label="Detail"
            name="detail"
            rules={[{ required: true, message: 'Please enter valid detail' }]}
          >
            <TextArea
              style={{ minHeight: 200 }}
              maxLength={1000}
              className="border rounded-lg"
              placeholder="Enter any additional details..."
            />
          </Form.Item>
          <h2 className="text-lg font-bold">Submission Details</h2>
          <div className='w-full sm:flex-none md:flex-none lg:flex xl:flex'>
            <div className="flex flex-col space-y-1 sm:w-full p-2">
              <div className="flex justify-between">
                <span className="font-semibold">Name:</span>
                <span>{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Phone:</span>
                <span>{formData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Address:</span>
                <span>{formData.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">District:</span>
                <span>{formData.district}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Sub-district:</span>
                <span>{formData.subdistrict}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Province:</span>
                <span>{formData.province}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Postal Code:</span>
                <span>{formData.postalCode}</span>
              </div>
            </div>

              <div className="space-y-4 sm:w-full p-2">
                <h3 className="font-semibold text-lg">Equipment:</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-[20%] ">
                  {selectedItems.map((equip, index) => (
                    <div key={index} className="flex flex-col items-center p-2 rounded-lg shadow-lg border border-gray-200 bg-gray-50">
                      {/* Display image */}
                      <div className="w-18 h-18 mb-2">
                        <Image
                          width={96}
                          height={96}
                          alt="Equipment"
                          src={`/api/image/equipment?id=${equip.value}`}
                          style={{ objectFit: 'cover' }}
                          className="rounded-md"
                        />
                      </div>

                      {/* Display equipment label */}
                      <div className="w-full flex flex-col items-center">
                        <span className="font-bold">{index + 1}. {equip.label}</span>
                        <span className="text-gray-500"><span className="font-semibold">S/N:</span> {equip.serial_no}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
        </div>
      ),
    }

  ];
  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
  }));


  return (
    <div className="w-full h-[100vh] bg-red-700 bg-gradient-to-b from-[#ff0000] via-red-100 to-[#ff0000]">
      <div className="grid grid-cols-1">
        <div className="bg-slate-400x flex justify-center py-2">
          <div className="service_logo text-white text-[24px] [text-shadow:_0_4px_4px_rgb(0_0_0_/_40%)]">
            SERVICE
          </div>
        </div>
      </div>

      <div className="h-[85%] p-4">
        <div className="w-full bg-white/50 h-[100%] rounded-2xl">
          <div className="bg-white h-full w-full rounded-lg overflow-scroll p-4">
            <h2 className="text-center font-bold text-xl">Create New Ticket Form</h2>
            <Form layout="vertical" form={form} className="space-y-1" onFinish={onFinish}>
              <Steps responsive={false} current={current} items={items} className="mt-6 mb-4" labelPlacement="vertical" />

              <div>{steps[current].content}</div>

              <div className="flex justify-end mt-4">
                {current > 0 && (
                  <Button onClick={prev} className="mr-2">
                    Previous
                  </Button>
                )}
                {current < steps.length - 1 && (
                  <Button type="primary" onClick={next}>
                    Next
                  </Button>
                )}
                {current === steps.length - 1 && (
                  <Button type="primary" onClick={handleDone}>
                    Submit
                  </Button>
                )}
              </div>

            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateTicketForm;
