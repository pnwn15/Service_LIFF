import { useEffect, useState } from 'react';
import { Button, Table, Modal, Select, Typography } from 'antd';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import axios from 'axios';
import Image from 'next/image';

const { Title } = Typography;

const columns = [
    {
        title: 'No.',
        dataIndex: 'id',
        width: 50,
    },
    {
        title: 'name',
        dataIndex: 'name',
        width: 230,
    },
    {
        title: 'position',
        dataIndex: 'position',
        width: 100,
    },
];

function ParticipantTable({data,id,updatefn}) {
    // const [data, setData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [Selected, setSelected] = useState([]);

    const [productChunks, setProductChunks] = useState([]);

    const fetchData = async (data) => {
        try {

            // let i = 0;
            // while (data.length < 90) {
            //     data.push({
            //         id: i,
            //         name: `นายรามอินทรา กม.${i}`,
            //         phone: '09899959494',
            //         position: `ช่างซ่อมบำรุง ${i}`,
            //     });

            //     options.push({
            //         value: `นายรามอินทรา กม.${i}`,
            //         label: `นายรามอินทรา กม.${i}`,
            //         id: i,
            //     });
            //     i += 1;
            // }

            setProductChunks(chunkUser(data.participants,4));
            //console.log(data.participants.map((participant,index)=>(participant.id)))
            setOptions(
                data.allowed_participants.map((participant,index)=>({"value":participant.id,"label":participant.name,"id":index}))
            )
            setSelected(data.participants.map((participant,index)=>(participant.id)))

       
        } catch (error) {
            console.error(error);
        }
    };

    useEffect( () => {
         fetchData(data);
    }, [data]);

 

    // const handleSearch = (value) => {
    //     if (!value) {
    //         setOptions([]);
    //     } else {
    //         const filteredOptions = data
    //             .filter((item) => item.name.toLowerCase().includes(value.toLowerCase()))
    //             .map((item) => ({
    //                 value: item.name,
    //                 label: item.name,
    //                 id: item.id,
    //             }));
    //         setOptions(filteredOptions);
    //     }
    // };

    const handleChange = (value) => {
       setSelected(value);
    };

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = async () => {
        // save selected to db
        setIsModalOpen(false);
        // alert('saved to db');
        // {
        //     "participants":[2]
        //     }
        await axios.patch(`/api/maintenance/job/${id}`
            ,data={
                "participants":Selected
            })
            .then(
                 (res)=>{
                    // console.log("PARTICIPANT SAVED")
                    updatefn([1])
                }
            )
            .catch(
                (err)=>{
                    console.error(err)
                }
            )
       
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const chunkUser = (arr, size) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    };


    

    return (
        <>
            <div className='flex justify-between items-center mb-2'>
                <div className='font-bold  w-auto '> Participants:</div>
                <div className=''>
                    {(data.write) && <Button onClick={showModal} className='bg-green-500 text-white font-bold rounded-lg' type="primary">
                        Add
                    </Button>}
                </div>
            </div>
            <div className="bg-yellow-200x shadow-mdx">
                {/*         <Table
                    pagination={false}
                    className='custom-table'
                    columns={columns}
                    dataSource={data}
                    scroll={{ y: 180 }}
                /> */}
                <div className='w-full bg-green-400x  h-[200px]'>
                    <Swiper
                        pagination={{
                            dynamicBullets: true,
                        }}
                        modules={[Pagination]}
                        className="w-full h-full">


                        {productChunks.map((chunk, index) => (
                            <SwiperSlide style={{ padding: "0 !important" }} key={index}>
                                <div className='w-full h-full grid   grid-cols-2 bg-purple-500x'>
                                    {chunk.map((product, idx) => (
                                        <div key={idx} className={`w-full  h-full bg-yellow-500x`}>
                                            <div className='w-full h-full m-1 bg-red-500x rounded-lg '>
                                                <div className="text-[10px] w-full  bg-slate-500x h-full   ">
                                                    <div className="flex flex-col m-1 bg-white rounded-md p-1 justify-center items-center">
                                                        <Image width={36} height={36} className="w-10 h-10 rounded-md" src="https://cdn-icons-png.flaticon.com/512/7067/7067706.png"  alt={`${product.name}`} />
                                                        <h2 className=''>{product.name}</h2>
                                                        <p>{product.department}</p>
                                                        <p>{product.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SwiperSlide>
                        ))}




                    </Swiper>
                </div>
            </div>
            <Modal  open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>


                <Title level={4}>Add Participants ({Selected.length})</Title>
                <Select
                    mode="multiple"
                    style={{
                        width: '100%',
                    }}
                    placeholder="Search participant"
                    defaultValue={[]}
                    onChange={handleChange}
                    options={options}
                    value={Selected}
                   
                />




            </Modal>
        </>
    );
}

export default ParticipantTable;